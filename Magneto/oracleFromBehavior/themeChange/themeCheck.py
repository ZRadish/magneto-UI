import cv2
import numpy as np
import argparse
import colour  # pip install colour-science
import warnings
warnings.filterwarnings("ignore", message="Failed to load image Python extension")

import json
import os
import sys
import difflib

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet    

import io

# ------------------ DUO LOGGING SETUP ------------------
class MultiLogger:
    """
    Sends all 'print' output to both the real console and an in-memory buffer (for PDF).
    """
    def __init__(self, *outputs):
        self.outputs = outputs

    def write(self, message):
        for output in self.outputs:
            output.write(message)
            output.flush()

    def flush(self):
        for output in self.outputs:
            output.flush()

# Capture console output in a buffer
console_output_buffer = io.StringIO()
# Save original stdout
original_stdout = sys.stdout
# Redirect prints to both console & buffer
sys.stdout = MultiLogger(original_stdout, console_output_buffer)
# -------------------------------------------------------

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Add the parent directory to sys.path
parent_dir = os.path.dirname(script_dir)
sys.path.append(parent_dir)

import imageUtilities as imgUtil
import xmlUtilities
import labelPredictor

detailedResult = True
tracePlayerGenerated = True

def load_arguments():
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="appName")
    ap.add_argument("-b", "--bugId", required=True, help="bug id")
    ap.add_argument("--unzip-dir", required=True, help="Path to the unzipped folder (contains bugId subfolder)")
    args = vars(ap.parse_args())
    return args

def read_json(jsonName):
    with open(jsonName) as f:
        data = json.load(f)
    return data

def create_trigger_list():
    return ["theme", "night"]

def create_component_list():
    """List of components potentially used for theme change"""
    return ["switch", "radio", "checkbox", "toggle"]

def check_if_theme_set(image_name, xmlPath, tapPos, tappedComponent, listOfTriggerWords):
    """
    Checks if the clicked/tapped component was actually the theme or if it was near 'theme'
    (like a switch or toggle next to a 'theme' text).
    """
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
            # check if clicked component is at same bounding box as the word "theme"
            startY, endY = xmlUtilities.findParentBoundOfMatchingNode(xmlPath, listOfTriggerWords)
            if int(startY) < int(tapY) < int(endY):
                if any(words in tappedComponent.lower() for words in listOfComponents):
                    return True, True

        return False, False

    except Exception:
        return False, False

def find_xml_from_screenshot(unzip_dir, imagename, stepNum, args):
    """
    Construct the XML filename from screenshot, based on whether tracePlayerGenerated is True.
    If the file doesn't exist, we also try a CrashScope naming fallback.
    """
    bugId = args["bugId"]
    if tracePlayerGenerated:
        base = imagename.split(".User-Trace")[0]
        versionName = imagename.split("_")[1]
        xmlName = f"{base}-{versionName}-{bugId}-User-Trace-{stepNum}.xml"
    else:
        base = imagename.split("screen")[0]
        xmlName = f"{base}ui-dump.xml"

    fullpath = os.path.join(unzip_dir, bugId, xmlName)
    return fullpath

def get_step_details(step):
    """
    Returns:
      screen_index: numeric index of the step/screen
      tapPosition: the x,y from step["textEntry"] (space-separated)
      clicked_comp_name: name of the dynamic GUI component
    """
    screen_index = step["sequenceStep"]
    tapPosition = step["textEntry"].split(" ")
    clicked_comp_name = step["dynGuiComponent"]["name"] if "dynGuiComponent" in step else ""
    return screen_index, tapPosition, clicked_comp_name

def find_trigger_reading_image(listOfSteps, screen_count_map, listOfTriggerWords, args):
    """
    Return:
      triggerList: screens where a theme trigger was found
      correct_affected_image_map: {trigger_screen -> subsequent screens that are 'affected'}
      image_xml_map: {screen.png -> path/to/screen.xml}
      themeChangeSuccess: {trigger_screen -> bool indicating if theme actually changed}
    """

    unzip_dir = args["unzip_dir"]
    bugId = args["bugId"]
    triggerList = []
    correct_affected_image_map = {}
    image_xml_map = {}
    themeChangeSuccess = {}

    theme_set = False
    correct_screen_found = False
    correct_screen = None
    correct_theme_index = None
    text_in_trigger_screen = ""
    before_theme = ""
    oneStep = False
    lastScreen = ""

    for step in listOfSteps:
        if theme_set:
            oneStep = True  # After theme has been triggered once

        if "screenshot" not in step:
            continue

        start_screen = step["screenshot"]
        clicked_screen = start_screen.replace("augmented", "gui")
        result_screen = start_screen.replace("_augmented", "")

        screen_index, tapPos, clicked_comp_name = get_step_details(step)
        clicked_Image = os.path.join(unzip_dir, bugId, clicked_screen)
        xmlPath = find_xml_from_screenshot(unzip_dir, start_screen, screen_index, args)
        image_xml_map[result_screen] = xmlPath

        # If theme was set and we have found the correct screen, track subsequent screens
        if theme_set and correct_screen_found and screen_index > correct_theme_index:
            correct_affected_image_map[correct_screen].append(result_screen)

        # Attempt to detect the theme trigger
        if not theme_set:
            themeChanged, oneStep = check_if_theme_set(
                clicked_Image, xmlPath, tapPos, clicked_comp_name, listOfTriggerWords
            )

        # If theme was triggered right here...
        if themeChanged and not theme_set:
            if not oneStep:
                # means the user pressed 'theme' in the previous step?
                xmlPath = find_xml_from_screenshot(unzip_dir, lastScreen, screen_index - 1, args)

            # read text from that trigger screen
            text_in_trigger_screen = sorted(xmlUtilities.readTextInXml(xmlPath))
            theme_set = True
            correct_screen_found = False
            before_theme = imgUtil.is_image_light(os.path.join(unzip_dir, bugId, start_screen))

        lastScreen = start_screen

        if theme_set and not correct_screen_found and oneStep:
            # Compare the new screen's text vs. the old trigger screen's text
            text_in_screen = sorted(xmlUtilities.readTextInXml(xmlPath))
            seq_mat = difflib.SequenceMatcher()
            seq_mat.set_seqs(text_in_screen, text_in_trigger_screen)
            match_ratio = seq_mat.ratio()

            # If the new screen is 90%+ matching, call it the "correct" next screen
            if match_ratio >= 0.90:
                correct_screen_found = True
                correct_screen = result_screen
                correct_theme_index = screen_index
                triggerList.append(correct_screen)
                correct_affected_image_map[correct_screen] = []

                after_theme = imgUtil.is_image_light(os.path.join(unzip_dir, bugId, result_screen))
                if before_theme != after_theme:
                    themeChangeSuccess[correct_screen] = True
                else:
                    themeChangeSuccess[correct_screen] = False

    return triggerList, correct_affected_image_map, image_xml_map, themeChangeSuccess

def check_if_keyboard_visible(imageName):
    img = cv2.imread(imageName)
    croppedA = imgUtil.crop_keyboard(img)
    return labelPredictor.has_keyboard(croppedA)

def preprocess_text(txt):
    """
    Lowercase, remove extra newlines/spaces.
    """
    result = []
    for t in txt:
        t = t.replace("\n", " ").lower().strip()
        t = t.replace("  ", " ")
        result.append(t)
    return result

def getFocusedElement(xmlPath):
    return xmlUtilities.readBoundOfFocusedElement(xmlPath)

def check_text_visibility(unzip_dir, bugId, affected_image, xmlPath):
    img_path = os.path.join(unzip_dir, bugId)
    txt_from_img = sorted(imgUtil.read_text_on_screen(img_path, affected_image))
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
        print("If delta_E < 2, images are generally considered perceptually equivalent.")
        print(f"The delta_E value for this image vs. {trigger} is {delta_E}")
        print("-------------------------------------------------------------------------------------------")

    return (delta_E, is_consistent)

def main():
    # ----------------------- MAIN LOGIC -----------------------
    args = load_arguments()
    unzip_dir = args["unzip_dir"]
    bugId = args["bugId"]
    screen_count_map = {}

    data = read_json(os.path.join(unzip_dir, bugId, f"Execution-{bugId}.json"))
    listOfTriggerWords = create_trigger_list()

    print("ORACLE FOR THEME CHANGE")

    triggerList = []
    correct_affected_image_map = {}
    image_xml_map = {}
    themeChangeSuccess = {}

    # This dict holds info we want to show in the PDF
    pdf_summary = {
        "bugId": bugId,  # we'll store bugId here so we can find images later
        "theme_detected": False,
        "successful_changes": 0,
        "failed_changes": 0,
        "delta_e_values": [],     # each item = {"screen": X, "delta_e": Y, "consistent": bool}
        "text_visibility": [],    # each item = {"screen": X, "visible_pct": int, "missing_pct": int}
    }

    # Collect steps from the JSON
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

    # Check if we detected a theme change
    if len(triggerList) >= 1:
        print("Theme change detected")
        pdf_summary["theme_detected"] = True
    else:
        print("Theme change not detected")
        # Even if no theme, we generate the PDF with minimal info
        sys.stdout = original_stdout
        console_output = console_output_buffer.getvalue()
        pdf_path = os.path.join(unzip_dir, bugId, "theme_detection_report.pdf")
        generate_pdf_report(unzip_dir, pdf_summary, pdf_path, console_output)
        print(f"[INFO] PDF generated at: {pdf_path}")
        return

    # Was the theme change successful?
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

    # Evaluate whether new screens are consistent with the old theme
    print("---------------------------- Did theme match in all screen? -------------------------------")
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

    print("---------------------------- Did all text show in dark theme? ------------------------------")
    # Check text coverage
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

    # Now finalize by restoring stdout and building PDF
    sys.stdout = original_stdout
    console_output = console_output_buffer.getvalue()

    pdf_path = os.path.join(unzip_dir, bugId, "theme_detection_report.pdf")
    generate_pdf_report(unzip_dir, pdf_summary, pdf_path, console_output)
    print(f"\n[INFO] PDF generated at: {pdf_path}")


# ----------------------------------------------------------------
# HELPER FUNCTION FOR WRAPPING TEXT (to avoid going off the page)
# ----------------------------------------------------------------
def draw_wrapped_text(canvas, text, x, y, max_width, font='Helvetica', font_size=10, line_height=12):
    """
    Draw the 'text' at position (x, y), wrapping automatically if the line exceeds 'max_width'.
    Returns the new 'y' position after drawing.
    """
    canvas.setFont(font, font_size)
    words = text.split()
    current_line = ""
    
    for w in words:
        candidate = (current_line + " " + w).strip() if current_line else w
        width_of_candidate = stringWidth(candidate, font, font_size)
        
        if width_of_candidate <= max_width:
            current_line = candidate
        else:
            # Draw current_line since adding this word would exceed max_width
            canvas.drawString(x, y, current_line)
            y -= line_height
            current_line = w

    if current_line:
        canvas.drawString(x, y, current_line)
        y -= line_height

    return y


def draw_table_with_page_check(canvas, table, current_x, current_y, page_width, page_height, bottom_margin=50):
    """
    Draws a table on the canvas, forcing a page break if there is not
    enough space left on the current page for the entire table.
    Returns the new y-position after drawing.
    """
    table_width, table_height = table.wrap(0, 0)
    # If the table won't fit in the remaining space, start a new page
    if current_y - table_height < bottom_margin:
        canvas.showPage()
        canvas.setFont("Helvetica", 10)  # reset font if needed
        current_y = page_height - bottom_margin
    
    table.drawOn(canvas, current_x, current_y - table_height)
    current_y -= table_height  # update our running y-position
    return current_y


# ----------------------------------------------------------------
# PDF GENERATION FUNCTION (WRAPPED TEXT + CENTERED TABLES + IMAGES)
# ----------------------------------------------------------------
def generate_pdf_report(unzip_dir, summary, pdf_path, console_output):
    """
    1) Include the *entire console output* at the top of the PDF (wrapped).
    2) New page: summary + tables (Delta_E, text visibility) centered.
    3) Then add the failed theme-check pages (where consistent=False) at 250x250,
       at the bottom (stacked vertically). We do page-breaks as needed.
    """
    c = canvas.Canvas(pdf_path, pagesize=A4)
    page_width, page_height = A4

    x_margin = 25
    y_margin = 50
    y_position = page_height - y_margin 

    # ============ Title ============
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_margin, y_position, "Theme Change Detection Report")
    y_position -= 20

    # ============ Console Logs (Wrapped) ============
    max_text_width = page_width - (2 * x_margin)

    for line in console_output.split("\n"):
        y_position = draw_wrapped_text(
            c, line, x_margin, y_position,
            max_width=max_text_width,
            font='Helvetica', font_size=8,
            line_height=10
        )
        if y_position < 60:  # If near bottom, new page
            c.showPage()
            c.setFont("Helvetica", 9)
            y_position = page_height - y_margin

    # Go to new page for summary
    c.showPage()
    y_position = page_height - y_margin

    # Basic summary
    bugId = summary["bugId"]  # We stored it in main
    theme_detected = summary["theme_detected"]
    success_changes = summary["successful_changes"]
    fail_changes = summary["failed_changes"]

    c.setFont("Helvetica-Bold", 11)
    c.drawString(x_margin, y_position, "Summary:")
    y_position -= 20

    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y_position, f"Theme Detected: {'Yes' if theme_detected else 'No'}")
    y_position -= 15
    c.drawString(x_margin, y_position, f"Successful Changes: {success_changes}")
    y_position -= 15
    c.drawString(x_margin, y_position, f"Failed Changes: {fail_changes}")
    y_position -= 25

    # ---------------- 1) Delta_E Table ----------------
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y_position, "Delta_E Consistency:")
    y_position -= 20

    styles = getSampleStyleSheet()
    styleN = styles["BodyText"]

    delta_data = [["Screen", "Delta_E", "Consistent? (<=2)"]]
    for item in summary["delta_e_values"]:
        screen_name = Paragraph(item["screen"], styleN)  # <--- Now a Paragraph
        de_val = round(item["delta_e"], 2)
        status = "Yes" if item["consistent"] else "No"
        delta_data.append([screen_name, str(de_val), status])

    delta_table = Table(delta_data, colWidths=[390, 70, 100])  # Adjust col widths as needed
    delta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))

    table_width, table_height = delta_table.wrapOn(c, 0, 0)
    table_x = (page_width - table_width) / 2
    # then call your draw_table_with_page_check but pass table_x, not a fixed 400 offset
    y_position = draw_table_with_page_check(
        c,
        delta_table,
        table_x,
        y_position,
        page_width,
        page_height
    )
    y_position -= 30

    # ---------------- 2) Text Visibility Table ----------------
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y_position, "Text Visibility Results:")
    y_position -= 20

    tv_data = [["Screen", "Visible (%)", "Missing (%)"]]
    for item in summary["text_visibility"]:
        screen_name = Paragraph(item["screen"], styleN)
        visible_pct = item["visible_pct"]
        missing_pct = item["missing_pct"]
        tv_data.append([screen_name, f"{visible_pct}%", f"{missing_pct}%"])

    tv_table = Table(tv_data, colWidths=[390, 70, 100])  # Adjust as needed
    tv_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))

    table_width, table_height = tv_table.wrapOn(c, 0, 0)
    table_x = (page_width - table_width) / 2
    y_position = draw_table_with_page_check(
        c,
        tv_table,
        table_x,
        y_position,
        page_width,
        page_height
    )
    y_position -= 30

    # ============= 3) Failed ThemeCheck Pages (Images) ============
    # Find pages that failed the theme consistency check
    failed_pages = [d for d in summary["delta_e_values"] if d["consistent"] == False]
    if failed_pages:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x_margin, y_position, "Failed ThemeCheck Pages:")
        y_position -= 20

        for f in failed_pages:
            img_name = f["screen"]  # e.g. "screen_3.png" or similar
            img_path = os.path.join(unzip_dir, bugId, img_name)
            if os.path.exists(img_path):
                # Reserve space for a 250x250 image
                # Check if we need a new page
                if (y_position - 250) < 50:
                    c.showPage()
                    c.setFont("Helvetica", 10)
                    y_position = page_height - y_margin

                # Optionally label the image:
                c.drawString(x_margin, y_position, f"Screenshot: {img_name}")
                y_position -= 15

                # Draw the image at 250x250
                c.drawImage(
                    img_path,
                    x_margin,
                    y_position - 200,
                    width=200,
                    height=200,
                    preserveAspectRatio=True
                )
                y_position -= (250 + 30)  # space after the image

            else:
                # If the file doesn't exist, note that in the PDF
                c.setFont("Helvetica", 10)
                c.drawString(x_margin, y_position, f"(Image not found: {img_path})")
                y_position -= 20

    c.save()

# ----------------------------------------------------------------------------------
# Entry point
# ----------------------------------------------------------------------------------
if __name__ == "__main__":
    main()