import cv2
import numpy as np
import argparse
import colour  # for delta_E calc:  pip install colour-science
import warnings
warnings.filterwarnings("ignore", message="Failed to load image Python extension")

import json
import os
import sys
import difflib

# For PDF generation
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors

# Adjust Python path if needed
scriptLocation = os.path.dirname(os.path.abspath(__file__))
parentDir = os.path.abspath(os.path.join(scriptLocation, ".."))
sys.path.insert(0, parentDir)

import imageUtilities as imgUtil
import xmlUtilities
import labelPredictor

detailedResult = True
tracePlayerGenerated = True

def load_arguments():
    """Add CLI arguments, including --unzip-dir for the absolute path of unzipped data."""
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="appName")
    ap.add_argument("-b", "--bugId", required=True, help="bug id")
    ap.add_argument("--unzip-dir", required=True, help="Path to the unzipped folder (contains bugId subfolder)")
    args = vars(ap.parse_args())
    return args

def read_json(json_path):
    with open(json_path, "r") as f:
        return json.load(f)

def create_trigger_list():
    """Words that might indicate a 'theme' change."""
    return ["theme", "night"]

def create_component_list():
    """Components that might toggle theme."""
    return ["switch", "radio", "checkbox", "toggle"]

def check_if_theme_set(image_path, xml_path, tapPos, tappedComponent, listOfTriggerWords):
    """
    Checks if the interacted component was 'theme' or a switch/toggle near 'theme'.
    Returns two booleans: (themeChanged, oneStep).
    """
    try:
        tapY = tapPos[-1] if tapPos else "-1"
        tapX = tapPos[-2] if len(tapPos) > 1 else "-1"
        if tapX == "-1" or tapY == "-1":
            return False, False

        text = imgUtil.readTextInImage(image_path)
        compList = create_component_list()

        # If the entire screen text contains "theme"
        if "theme" in text.lower():
            return True, False
        else:
            startY, endY = xmlUtilities.findParentBoundOfMatchingNode(xml_path, listOfTriggerWords)
            # Check if tapped component is horizontally aligned with "theme"
            if int(startY) < int(tapY) < int(endY):
                if any(words in tappedComponent.lower() for words in compList):
                    return True, True

        return False, False
    except Exception:
        # If anything fails in the above logic, just return no-theme
        return False, False

def find_xml_from_screenshot(unzip_dir, bugId, screenshot_name, stepNum):
    """
    Construct the expected XML filename from the screenshot.
    Return the absolute path to that XML in the unzipped folder.
    """
    if tracePlayerGenerated:
        # Example: someScreen.User-Trace_xyz_bugId_User-Trace_stepNum.xml
        xmlName = screenshot_name.split(".User-Trace")[0]
        versionName = screenshot_name.split("_")[1]
        xmlName += f"-{versionName}-{bugId}-User-Trace-{stepNum}.xml"
    else:
        # fallback if not using tracePlayer naming
        xmlName = screenshot_name.split("screen")[0] + "ui-dump.xml"

    fullpath = os.path.join(unzip_dir, bugId, xmlName)
    if not os.path.exists(fullpath):
        fullpath = find_xml_crashscope(unzip_dir, bugId, screenshot_name, stepNum)
    return fullpath

def find_xml_crashscope(unzip_dir, bugId, screenshot_name, stepNum):
    """
    CrashScope fallback naming.
    """
    dot_split_parts = screenshot_name.split('.')
    underscore_split_parts = screenshot_name.split('_')
    if tracePlayerGenerated:
        xmlName = (
            f"{dot_split_parts[0]}.{dot_split_parts[1]}.{dot_split_parts[2]}-"
            f"{underscore_split_parts[2]}-{bugId}-"
            f"{dot_split_parts[4]}-{dot_split_parts[3]}-{stepNum}.xml"
        )
    return os.path.join(unzip_dir, bugId, xmlName)

def get_step_details(step):
    screen_index = step["sequenceStep"]
    tapPosition = step["textEntry"].split(" ")
    clicked_comp_name = step["dynGuiComponent"].get("name", "") if "dynGuiComponent" in step else ""
    return screen_index, tapPosition, clicked_comp_name

def find_trigger_reading_image(listOfSteps, screen_count_map, listOfTriggerWords, args):
    """
    Walks through each step to see if 'theme' was triggered.
    Returns:
      - triggerList: list of final screens where theme was recognized
      - correct_affected_image_map: {triggerScreen -> [subsequentScreens]}
      - image_xml_map: {screenName -> xmlPath}
      - themeChangeSuccess: {triggerScreen -> bool}
    """
    unzip_dir = args["unzip_dir"]
    bugId = args["bugId"]

    triggerList = []
    correct_affected_image_map = {}
    image_xml_map = {}
    themeChangeSuccess = {}

    theme_set = False
    correct_screen_found = False
    correct_theme_index = None
    text_in_trigger_screen = ""
    correct_screen = None
    before_theme = ""
    oneStep = False
    lastScreen = ""

    for step in listOfSteps:
        if "screenshot" not in step:
            continue

        start_screen = step["screenshot"]
        clicked_screen = start_screen.replace("augmented", "gui")
        result_screen = start_screen.replace("_augmented", "")

        screen_index, tapPos, clicked_comp_name = get_step_details(step)
        clicked_Image = os.path.join(unzip_dir, bugId, clicked_screen)

        xmlPath = find_xml_from_screenshot(unzip_dir, bugId, start_screen, screen_index)
        image_xml_map[result_screen] = xmlPath

        if theme_set:
            oneStep = True

        # If theme not yet set, check if this step triggers it
        if not theme_set:
            themeChanged, oneStep = check_if_theme_set(
                clicked_Image, xmlPath, tapPos, clicked_comp_name, listOfTriggerWords
            )
        if themeChanged and not theme_set:
            # The actual step was in the previous screenshot if oneStep == False
            if not oneStep:
                xmlPath = find_xml_from_screenshot(unzip_dir, bugId, lastScreen, screen_index - 1)
            text_in_trigger_screen = sorted(xmlUtilities.readTextInXml(xmlPath))

            theme_set = True
            correct_screen_found = False
            before_theme = imgUtil.is_image_light(os.path.join(unzip_dir, bugId, start_screen))

        lastScreen = start_screen

        # Once we detect theme_set, we try to identify the final confirmation screen
        if theme_set and not correct_screen_found and oneStep:
            text_in_screen = sorted(xmlUtilities.readTextInXml(xmlPath))
            seq_mat = difflib.SequenceMatcher()
            seq_mat.set_seqs(text_in_screen, text_in_trigger_screen)
            match_ratio = seq_mat.ratio()

            if match_ratio >= 0.90:
                correct_screen_found = True
                correct_screen = result_screen
                correct_theme_index = screen_index
                triggerList.append(correct_screen)
                correct_affected_image_map[correct_screen] = []

                after_theme = imgUtil.is_image_light(os.path.join(unzip_dir, bugId, result_screen))
                # Did the background actually change from light -> dark (or vice versa)?
                themeChangeSuccess[correct_screen] = (before_theme != after_theme)

        if theme_set and correct_screen_found and screen_index > correct_theme_index:
            correct_affected_image_map[correct_screen].append(result_screen)

    return triggerList, correct_affected_image_map, image_xml_map, themeChangeSuccess

def check_if_keyboard_visible(imagePath):
    """Returns True if an on-screen keyboard is visible in the image."""
    img = cv2.imread(imagePath)
    croppedA = imgUtil.crop_keyboard(img)
    return labelPredictor.has_keyboard(croppedA)

def main():
    args = load_arguments()
    unzip_dir = args["unzip_dir"]
    bugId = args["bugId"]

    # 1) Load JSON
    json_path = os.path.join(unzip_dir, bugId, f"Execution-{bugId}.json")
    if not os.path.exists(json_path):
        print(f"JSON not found at: {json_path}")
        return
    data = read_json(json_path)

    # 2) Build a PDF summary object
    pdf_summary = {
        "theme_detected": False,
        "successful_changes": 0,
        "failed_changes": 0,
        "delta_e_values": [],   # each: {screen, delta_e, consistent}
        "text_visibility": [],  # each: {screen, visible_pct, missing_pct}
    }

    # 3) Collect steps, find triggers
    if "steps" in data:
        listOfSteps = data["steps"]
    else:
        print("No 'steps' found in JSON. Exiting.")
        return

    listOfTriggerWords = create_trigger_list()
    screen_count_map = {}

    (triggerList,
     correct_affected_image_map,
     image_xml_map,
     themeChangeSuccess) = find_trigger_reading_image(listOfSteps, screen_count_map, listOfTriggerWords, args)

    # 4) Check if theme was triggered
    if len(triggerList) > 0:
        print("Theme change detected")
        pdf_summary["theme_detected"] = True
    else:
        print("Theme change not detected")
        # Still generate a PDF for consistency
        pdf_path = os.path.join(unzip_dir, bugId, "theme_detection_report.pdf")
        generate_pdf_report(pdf_summary, pdf_path)
        return

    # 5) Was the theme change successful on each trigger?
    print("---------- Was theme changed successfully? ----------")
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

    # 6) Check if theme is consistent across subsequent screens
    print("----------- Did theme match in all screens? -----------")
    for trigger in triggerList:
        all_affected_images = correct_affected_image_map[trigger]
        trigger_path = os.path.join(unzip_dir, bugId, trigger)
        hasKeyboard = check_if_keyboard_visible(trigger_path)
        lab1 = imgUtil.get_lab_val(trigger_path, hasKeyboard, None)

        for affected_image in all_affected_images:
            affected_path = os.path.join(unzip_dir, bugId, affected_image)
            hasKeyboard2 = check_if_keyboard_visible(affected_path)
            xmlPath = image_xml_map[affected_image]
            bounds = getFocusedElement(xmlPath)

            lab2 = imgUtil.get_lab_val(affected_path, hasKeyboard2, bounds)
            delta_e_val, is_consistent = is_theme_matching(lab1, lab2, trigger_path, affected_path)
            pdf_summary["delta_e_values"].append({
                "screen": affected_image,
                "delta_e": delta_e_val,
                "consistent": is_consistent
            })

    # 7) Check if text is visible in all screens after theme change
    print("--------- Did all text show up in dark theme? ---------")
    for trigger in triggerList:
        all_affected_images = correct_affected_image_map[trigger]
        for affected_image in all_affected_images:
            xmlPath = image_xml_map[affected_image]
            visible_pct = check_text_visibility(unzip_dir, bugId, affected_image, xmlPath)
            pdf_summary["text_visibility"].append({
                "screen": affected_image,
                "visible_pct": visible_pct,
                "missing_pct": 100 - visible_pct
            })

    # 8) Generate the PDF report
    pdf_path = os.path.join(unzip_dir, bugId, "theme_detection_report.pdf")
    generate_pdf_report(pdf_summary, pdf_path)

def getFocusedElement(xmlPath):
    return xmlUtilities.readBoundOfFocusedElement(xmlPath)

def check_text_visibility(unzip_dir, bugId, affected_image, xmlPath):
    """
    Compare OCR text vs. XML text to see how many strings are visible.
    Returns an integer percentage of how many strings matched.
    """
    img_path = os.path.join(unzip_dir, bugId, affected_image)
    txt_from_img = sorted(imgUtil.read_text_on_screen(img_path, affected_image))
    txt_from_xml = sorted(xmlUtilities.readTextInXml(xmlPath))

    txt_from_img = preprocess_text(txt_from_img)
    txt_from_xml = preprocess_text(txt_from_xml)

    if len(txt_from_xml) == 0:
        print("Most text shows in", affected_image, "(No text in XML to compare)")
        return 100  # No text to compare, so let's assume 100% coverage

    diff = set(txt_from_xml) - set(txt_from_img)
    bad_frac = len(diff) / len(txt_from_xml)

    if bad_frac <= 0.5:
        print("Most text shows in", affected_image)
    else:
        print("{:.2%} of text didn't show in".format(bad_frac), affected_image)

    visible_pct = int(round((1 - bad_frac) * 100))
    return visible_pct

def preprocess_text(txt_list):
    """
    Normalize text for easier comparisons:
    1) lowercase
    2) remove extra spaces/newlines
    """
    result = []
    for t in txt_list:
        t = t.replace("\n", " ").lower().strip()
        t = t.replace("  ", " ")
        result.append(t)
    return result

def is_theme_matching(lab1, lab2, trigger_path, affected_path):
    """
    Compare two LAB color vectors with delta_E.
    Return (delta_E, bool_is_consistent).
    """
    delta_E = colour.delta_E(lab1, lab2)
    is_consistent = True
    if delta_E > 2:
        print("Test failed: theme change is inconsistent on image", affected_path)
        is_consistent = False
    else:
        print("Test passed: theme is consistent on image", affected_path)

    if detailedResult:
        print("======== DETAILED RESULT ========")
        print("Delta E < 2 is generally considered perceptually equivalent.")
        print(f"Comparing {affected_path} to {trigger_path}, got delta_E = {delta_E}")
        print("=================================")

    return (delta_E, is_consistent)

# ------------------- PDF GENERATION -------------------

def generate_pdf_report(summary, pdf_path):
    """
    Generate a single-page PDF with:
      - Basic summary info (theme detected, success/fail)
      - Table of delta_E values
      - Table of text visibility
    """
    top_margin = 40
    left_margin = 17
    line_gap_title = 30
    line_gap_subtitle = 20
    line_gap_text = 15
    spacer_after_table = 30

    total_height = top_margin

    # Summaries
    total_height += line_gap_title  # Title
    total_height += line_gap_subtitle  # "Summary:"
    total_height += 3 * line_gap_text  # 3 lines of text
    total_height += line_gap_subtitle  # Gap before table
    total_height += line_gap_subtitle  # "Delta_E Consistency" text

    # Build the Delta_E table
    delta_table_data = [["Screen", "Delta_E", "Consistent?\n(delta_E<=2)"]]
    for item in summary["delta_e_values"]:
        screen_name = item["screen"]
        de_val = round(item["delta_e"], 2)
        status = "Yes" if item["consistent"] else "No"
        delta_table_data.append([screen_name, str(de_val), status])

    delta_table = Table(delta_table_data, colWidths=[400, 80, 80])
    delta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ])
    )
    _, table_height = delta_table.wrap(0, 0)
    total_height += table_height
    total_height += spacer_after_table

    # Text Visibility table
    total_height += line_gap_subtitle  # "Text Visibility Results"
    tv_table_data = [["Screen", "Visible (%)", "Missing (%)"]]
    for item in summary["text_visibility"]:
        scr = item["screen"]
        visible_pct = item["visible_pct"]
        missing_pct = item["missing_pct"]
        tv_table_data.append([scr, f"{visible_pct}%", f"{missing_pct}%"])

    tv_table = Table(tv_table_data, colWidths=[400, 80, 80])
    tv_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ])
    )
    _, tv_table_height = tv_table.wrap(0, 0)
    total_height += tv_table_height
    total_height += spacer_after_table

    from reportlab.lib.pagesizes import A4
    a4_width, a4_height = A4
    final_page_height = max(a4_height, total_height)

    # Create the PDF
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

    print(f"PDF generated at: {pdf_path}")

if __name__ == "__main__":
    main()
