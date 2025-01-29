from email.mime import image
from posixpath import split
import cv2
import numpy as np
import argparse
import colour  # for delta_E calc :  pip install colour-science

import warnings
warnings.filterwarnings("ignore", message="Failed to load image Python extension")

import json
import os
import sys
import difflib

scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)
import imageUtilities as imgUtil
import xmlUtilities
import labelPredictor

# ---------- IMPORTS for PDF Generation ----------
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors

detailedResult = True
tracePlayerGenerated = True


def load_arguments():
    """construct the argument parse and parse the arguments"""
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="appName")
    ap.add_argument("-b", "--bugId", required=True, help="bug id")
    args = vars(ap.parse_args())
    return args


def read_json(jsonName):
    with open(jsonName) as f:
        data = json.load(f)
    return data


def create_trigger_list():
    listOfTriggerWords = []
    listOfTriggerWords.append("theme")
    listOfTriggerWords.append("night")
    return listOfTriggerWords


def create_component_list():
    """List of components potentially used for theme change"""
    listOfComponents = []
    listOfComponents.append("switch")
    listOfComponents.append("radio")
    listOfComponents.append("checkbox")
    listOfComponents.append("toggle")
    return listOfComponents


def check_if_theme_set(image_name, xmlPath, tapPos, tappedComponent, listOfTriggerWords):
    """Checks if the interacted component was theme or if it was switch/toggle near 'theme'."""
    try:
        tapY = tapPos[-1] if tapPos else "-1"
        tapX = tapPos[-2] if len(tapPos) > 1 else "-1"
        if tapX == "-1" or tapY == "-1":
            return False, False

        text = imgUtil.readTextInImage(image_name)
        listOfComponents = create_component_list()
        if "theme" in text.lower():
            return True, False
        else:
            startY, endY = xmlUtilities.findParentBoundOfMatchingNode(xmlPath, listOfTriggerWords)
            # check if clicked component is at same height as the word "theme"
            if int(startY) < int(tapY) < int(endY):
                if any(words in tappedComponent.lower() for words in listOfComponents):
                    return True, True

        return False, False

    except Exception:
        return False, False


def find_xml_from_screenshot(imagename, stepNum, args):
    xmlName = ""
    if tracePlayerGenerated:
        xmlName = imagename.split(".User-Trace")[0]
        versionName = imagename.split("_")[1]
        xmlName += "-" + versionName + "-" + args["bugId"] + "-User-Trace-" + str(stepNum) + ".xml"
    else:
        xmlName = imagename.split("screen")[0]
        xmlName += "ui-dump.xml"

    fullpath = os.path.join(args["bugId"], xmlName)
    if not os.path.exists(fullpath):
        # Possibly CrashScope naming
        fullpath = find_xml_crashscope(imagename, stepNum, args)
    return fullpath


def find_xml_crashscope(imagename, stepNum, args):
    dot_split_parts = imagename.split('.')
    underscore_split_parts = imagename.split('_')
    if tracePlayerGenerated:
        xmlName = (
            f"{dot_split_parts[0]}.{dot_split_parts[1]}.{dot_split_parts[2]}-"
            f"{underscore_split_parts[2]}-{args['bugId']}-"
            f"{dot_split_parts[4]}-{dot_split_parts[3]}-{str(stepNum)}.xml"
        )
    return os.path.join(args["bugId"], xmlName)


def get_step_details(step):
    screen_index = step["sequenceStep"]
    tapPosition = step["textEntry"].split(" ")
    clicked_comp_name = step["dynGuiComponent"]["name"] if "dynGuiComponent" in step else ""
    return screen_index, tapPosition, clicked_comp_name


def find_trigger_reading_image(listOfSteps, screen_count_map, listOfTriggerWords, args):
    """
    Return:
        triggerList: screens where the theme trigger was found
        correct_affected_image_map: map from a trigger screen -> subsequent screens
        image_xml_map: map from screen -> XML path
        themeChangeSuccess: map from screen -> bool (did theme actually change?)
    """
    screen_background = "light"
    triggerList = []
    theme_set = False
    correct_screen_found = False
    correct_theme_index = None
    text_in_trigger_screen = ""
    correct_screen = None
    correct_affected_image_map = {}
    image_xml_map = {}
    bugId = args["bugId"]
    correct_xml = None
    themeChangeSuccess = {}
    before_theme = ""
    oneStep = False
    lastScreen = ""

    for step in listOfSteps:
        if theme_set:
            oneStep = True

        if "screenshot" not in step:
            continue
        else:
            start_screen = step["screenshot"]
        clicked_screen = start_screen.replace("augmented", "gui")
        result_screen = start_screen.replace("_augmented", "")

        screen_index, tapPos, clicked_comp_name = get_step_details(step)
        clicked_Image = os.path.join(bugId, clicked_screen)
        xmlPath = find_xml_from_screenshot(start_screen, screen_index, args)
        image_xml_map[result_screen] = xmlPath

        if theme_set and correct_screen_found and screen_index > correct_theme_index:
            correct_affected_image_map[correct_screen].append(result_screen)

        if not theme_set:
            themeChanged, oneStep = check_if_theme_set(
                clicked_Image, xmlPath, tapPos, clicked_comp_name, listOfTriggerWords
            )
        if themeChanged and not theme_set:
            if not oneStep:
                xmlPath = find_xml_from_screenshot(lastScreen, screen_index - 1, args)
            text_in_trigger_screen = sorted(xmlUtilities.readTextInXml(xmlPath))
            theme_set = True
            correct_screen_found = False
            before_theme = imgUtil.is_image_light(os.path.join(bugId, start_screen))

        lastScreen = start_screen

        if theme_set and not correct_screen_found and oneStep:
            text_in_screen = sorted(xmlUtilities.readTextInXml(xmlPath))
            seq_mat = difflib.SequenceMatcher()
            seq_mat.set_seqs(text_in_screen, text_in_trigger_screen)
            match_ratio = seq_mat.ratio()
            if match_ratio >= 0.90:
                correct_screen_found = True
                correct_screen = result_screen
                correct_xml = xmlPath
                correct_theme_index = screen_index
                triggerList.append(correct_screen)
                correct_affected_image_map[correct_screen] = []
                after_theme = imgUtil.is_image_light(os.path.join(bugId, result_screen))
                if before_theme != after_theme:
                    themeChangeSuccess[correct_screen] = True
                else:
                    themeChangeSuccess[correct_screen] = False

    return triggerList, correct_affected_image_map, image_xml_map, themeChangeSuccess


def check_if_keyboard_visible(imageName):
    img = cv2.imread(imageName)
    croppedA = imgUtil.crop_keyboard(img)
    return labelPredictor.has_keyboard(croppedA)


def main():
    args = load_arguments()
    bugId = args["bugId"]
    screen_count_map = {}

    data = read_json(os.path.join(bugId, f"Execution-{bugId}.json"))
    listOfTriggerWords = create_trigger_list()

    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  ORACLE FOR THEME CHANGE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    triggerList = []
    correct_affected_image_map = {}
    image_xml_map = {}
    themeChangeSuccess = {}

    # Gather summary info for PDF
    pdf_summary = {
        "theme_detected": False,
        "successful_changes": 0,
        "failed_changes": 0,
        # We'll store detailed screen checks here:
        "delta_e_values": [],       # each item = {"screen": X, "delta_e": Y, "consistent": bool}
        "text_visibility": [],      # each item = {"screen": X, "visible_pct": 80, ...}
    }

    # Collect steps
    for line in data:
        if "steps" in line:
            listOfSteps = data["steps"]
            (
                triggerList,
                correct_affected_image_map,
                image_xml_map,
                themeChangeSuccess,
            ) = find_trigger_reading_image(
                listOfSteps, screen_count_map, listOfTriggerWords, args
            )

    # Theme detection check
    if len(triggerList) >= 1:
        print("Theme change detected")
        pdf_summary["theme_detected"] = True
    else:
        print("Theme change not detected")
        # Generate PDF anyway (as requested)
        pdf_path = os.path.join(bugId, "theme_detection_report.pdf")
        generate_pdf_report(pdf_summary, pdf_path)
        return

    print("--------------------------- Was theme changed successfully? -------------------------------")
    success_count = 0
    fail_count = 0
    for trigger in triggerList:
        if themeChangeSuccess[trigger]:
            print("Theme changed successfully")
            success_count += 1
        else:
            print("Theme change was not successful")
            fail_count += 1

    pdf_summary["successful_changes"] = success_count
    pdf_summary["failed_changes"] = fail_count

    print("---------------------------- Did theme match in all screen? -------------------------------")
    # Check theme consistency
    for trigger in triggerList:
        all_affected_images = correct_affected_image_map[trigger]
        hasKeyboard = check_if_keyboard_visible(os.path.join(bugId, trigger))
        print(trigger, bugId)
        lab1 = imgUtil.get_lab_val(os.path.join(bugId, trigger), hasKeyboard, None)
        for affected_image in all_affected_images:
            hasKeyboard2 = check_if_keyboard_visible(os.path.join(bugId, affected_image))
            xmlPath = image_xml_map[affected_image]
            bounds = getFocusedElement(xmlPath)
            lab2 = imgUtil.get_lab_val(os.path.join(bugId, affected_image), hasKeyboard2, bounds)
            delta_e_val, is_consistent = is_theme_matching(lab1, lab2, trigger, affected_image)

            pdf_summary["delta_e_values"].append({
                "screen": affected_image,
                "delta_e": delta_e_val,
                "consistent": is_consistent
            })

    print("---------------------------- Did all text show in dark theme? ------------------------------")
    # Check text coverage
    for trigger in triggerList:
        all_affected_images = correct_affected_image_map[trigger]
        for affected_image in all_affected_images:
            xmlPath = image_xml_map[affected_image]
            visible_pct = check_text_visibility(bugId, affected_image, xmlPath)
            pdf_summary["text_visibility"].append({
                "screen": affected_image,
                "visible_pct": visible_pct,
                "missing_pct": 100 - visible_pct
            })

    # Always create the PDF
    pdf_path = os.path.join(bugId, "theme_detection_report.pdf")
    generate_pdf_report(pdf_summary, pdf_path)


def preprocess_text(txt):
    result = []
    for t in txt:
        t = t.replace("\n", " ").lower().strip()
        t = t.replace("  ", " ")
        result.append(t)
    return result


def getFocusedElement(xmlPath):
    bounds = xmlUtilities.readBoundOfFocusedElement(xmlPath)
    return bounds


def check_text_visibility(bugId, affected_image, xmlPath):
    txt_from_img = sorted(imgUtil.read_text_on_screen(bugId, affected_image))
    txt_from_xml = sorted(xmlUtilities.readTextInXml(xmlPath))
    txt_from_img = preprocess_text(txt_from_img)
    txt_from_xml = preprocess_text(txt_from_xml)

    if len(txt_from_xml) == 0:
        print("Most text shows in", affected_image, "(No text in XML to compare)")
        return 100

    diff = set(txt_from_xml) - set(txt_from_img)
    bad_frac = len(diff) / len(txt_from_xml)

    if bad_frac <= 0.5:
        print("Most text shows in", affected_image)
    else:
        print("{:.2%} of text didn't show in".format(bad_frac), affected_image)

    visible_pct = int(round((1 - bad_frac) * 100))
    return visible_pct


def is_theme_matching(lab1, lab2, trigger, affected_image):
    delta_E = colour.delta_E(lab1, lab2)
    is_consistent = True
    if delta_E > 2:
        print("Test failed : the theme change is inconsistent on image", affected_image)
        is_consistent = False
    else:
        print("Test passed : the theme is consistent on image", affected_image)

    if detailedResult:
        print("===================================== DETAILED RESULT =====================================")
        print("If delta_E value of two images is < 2, images are generally considered perceptually equivalent.")
        print("The delta_E value for this image compared to", trigger, "is", delta_E)
        print("-------------------------------------------------------------------------------------------")

    return (delta_E, is_consistent)


def generate_pdf_report(summary, pdf_path):
    """
    Generate a single-page PDF that expands its height automatically
    based on the content (tables, text).
    """
    top_margin = 40
    left_margin = 17
    line_gap_title = 30
    line_gap_subtitle = 20
    line_gap_text = 15
    spacer_after_table = 30

    total_height = top_margin

    # Title
    total_height += line_gap_title
    # Summary title
    total_height += line_gap_subtitle
    # 3 lines of text
    total_height += 3 * line_gap_text
    # Gap before first table subtitle
    total_height += line_gap_subtitle
    # Subtitle for Delta_E
    total_height += line_gap_subtitle

    # Delta_E table
    delta_table_data = [["Screen", "Delta_E", "Consistent?\n(delta_E<=2)"]]
    for item in summary["delta_e_values"]:
        screen_name = item["screen"]
        de_val = round(item["delta_e"], 2)
        status = "Yes" if item["consistent"] else "No"
        delta_table_data.append([screen_name, str(de_val), status])

    delta_table = Table(delta_table_data, colWidths=[400, 80, 80])
    delta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ]
        )
    )
    _, table_height = delta_table.wrap(0, 0)
    total_height += table_height
    total_height += spacer_after_table

    # Subtitle for text visibility
    total_height += line_gap_subtitle

    # Text Visibility table
    tv_table_data = [["Screen", "Visible (%)", "Missing (%)"]]
    for item in summary["text_visibility"]:
        scr = item["screen"]
        visible_pct = item["visible_pct"]
        missing_pct = item["missing_pct"]
        tv_table_data.append([scr, f"{visible_pct}%", f"{missing_pct}%"])

    tv_table = Table(tv_table_data, colWidths=[400, 80, 80])
    tv_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ]
        )
    )
    _, tv_table_height = tv_table.wrap(0, 0)
    total_height += tv_table_height
    total_height += spacer_after_table

    a4_width, a4_height = A4
    final_page_height = max(a4_height, total_height)

    c = canvas.Canvas(pdf_path, pagesize=(a4_width, final_page_height))
    y_position = final_page_height - top_margin

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(left_margin, y_position, "Theme Change Detection Report")
    y_position -= line_gap_title

    # Summary
    c.setFont("Helvetica-Bold", 12)
    c.drawString(left_margin, y_position, "Summary:")
    y_position -= line_gap_subtitle

    c.setFont("Helvetica", 10)
    c.drawString(left_margin, y_position, f"Theme Detected: {'Yes' if summary['theme_detected'] else 'No'}")
    y_position -= line_gap_text
    c.drawString(left_margin, y_position, f"Successful Changes: {summary['successful_changes']}")
    y_position -= line_gap_text
    c.drawString(left_margin, y_position, f"Failed Changes: {summary['failed_changes']}")
    y_position -= line_gap_subtitle

    # Delta_E Title
    c.setFont("Helvetica-Bold", 12)
    c.drawString(left_margin, y_position, "Delta_E Consistency:")
    y_position -= line_gap_subtitle

    # Draw Delta_E Table
    delta_table.wrapOn(c, a4_width, final_page_height)
    delta_table.drawOn(c, left_margin, y_position - table_height)
    y_position -= (table_height + spacer_after_table)

    # Text Visibility Title
    c.setFont("Helvetica-Bold", 12)
    c.drawString(left_margin, y_position, "Text Visibility Results:")
    y_position -= line_gap_subtitle

    # Draw Text Visibility Table
    tv_table.wrapOn(c, a4_width, final_page_height)
    tv_table.drawOn(c, left_margin, y_position - tv_table_height)
    y_position -= (tv_table_height + spacer_after_table)

    c.save()

if __name__ == "__main__":
    main()
