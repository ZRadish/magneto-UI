from posixpath import splitext
from pydoc import splitdoc
from skimage.metrics import structural_similarity as compare_ssim
import argparse
import imutils
import cv2
import json
import os, sys
from pathlib import Path

import warnings
warnings.filterwarnings("ignore", message="Failed to load image Python extension")

# Location of imageUtilities.py
scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)

import imageUtilities as imgUtil
import labelPredictor

from reportlab.lib.pagesizes import A4
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# to display detailed result to developer
detailed_result = True
tracePlayerGenerated = True

def read_json(jsonName):
    with open(jsonName) as f:
        data = json.load(f)
    return data

def load_arguments():
    """construct the argument parse and parse the arguments"""
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="second")
    ap.add_argument("-b", "--bugId", required=True, help="first input image")
    # Removed the --pdf argument so the script always creates a PDF
    args = vars(ap.parse_args())
    return args

def crop_image(args, trigger, i):
    """Load/crop the two input images and remove status or bottom navigation bars."""
    try:
        imageA = cv2.imread(args["first"])
        croppedA = imgUtil.crop_keyboard(imageA)
        hasKeyboard = labelPredictor.has_keyboard(croppedA)
        if hasKeyboard:
            imageName = get_image_before(args, "first")
            imageA = cv2.imread(imageName)

        imageA = imgUtil.crop_bottom_notification(imageA)

    except Exception:
        print(args["first"] + " Image file not found")
        return None, None

    try:
        imageB = cv2.imread(args["second"])
        croppedB = imgUtil.crop_keyboard(imageB)
        hasKeyboard = labelPredictor.has_keyboard(croppedB)
        if hasKeyboard:
            imageName = get_image_before(args, "second")
            imageB = cv2.imread(imageName)

        imageB = imgUtil.crop_bottom_notification(imageB)

    except:
        print(args["second"] + " Image file not found")
        return None, None

    return imageA, imageB

def get_ssim(imageA, imageB):
    """Convert the images to grayscale and compute SSIM."""
    grayA = cv2.cvtColor(imageA, cv2.COLOR_BGR2GRAY)
    grayB = cv2.cvtColor(imageB, cv2.COLOR_BGR2GRAY)

    (score, diff) = compare_ssim(grayA, grayB, full=True)
    return score

def print_result(val, text_mismatch):
    """Print the result to terminal, based on SSIM and text mismatch."""
    if val > 0.8 and text_mismatch <= 0.5:
        print("Test passed : Back button behavior as expected")
    else:
        print("Test failed : Back button behavior was unexpected ")

    global detailed_result
    if detailed_result:
        print("===================================== DETAILED RESULT =====================================")
        print("SSIM val is in the range of -1 to 1. The threshold for similarity is 0.8.")
        print("Here the SSIM val is: {}".format(val))
        if text_mismatch != "":
            print("Text mismatch of {:.2%} ".format(text_mismatch))

def findTrigger(app_name, listOfSteps, dim):
    """Return dictionary of {sequenceStep -> screenshot} where back was triggered."""
    triggerList = {}
    width = int(dim.split("x")[0])
    height = int(dim.split("x")[1])

    for step in listOfSteps:
        if "dynGuiComponent" in step:
            dynGuiComponentData = step["dynGuiComponent"]
            command = step["textEntry"]
            try:
                x = int(command.split(" ")[-2])
                y = int(command.split(" ")[-1])
            except Exception:
                continue

            # Checking if the back button or an area near bottom-left was tapped.
            if (
                dynGuiComponentData["idXml"] == "BACK_MODAL"
                or x < (width // 3) and (height - 200) <= y
                and "tap" in command
            ):
                triggerList[str(step["sequenceStep"])] = step["screenshot"]
    return triggerList

def find_xml_from_screenshot(imagename, stepNum, args):
    xmlName = ""
    if tracePlayerGenerated:
        xmlName = imagename.split(".User-Trace")[0]
        xmlName += "-" + args["bugId"] + "-12-User-Trace-" + str(stepNum) + ".xml"
    else:
        xmlName = imagename.split("screen")[0]
        xmlName += "ui-dump.xml"

    return os.path.join(args["bugId"], os.path.join("xmls", xmlName))

def get_image_names(args, imageName, image_num):
    """
    Example:
      input:  (imageName=..., image_num="12")
      sets args["first"] and args["second"] to the relevant paths
    """
    bugId = args["bugId"]
    appName = args["appName"]
    # We assume the screenshot name ends with e.g. "12_augmented.png"
    # So we parse out everything up to '12_augmented'
    splitText = image_num + "_augmented"
    path = imageName.split(splitText)[0]

    # "first" => 2 steps before
    index_f = int(image_num) - 2
    first_image_path = os.path.join(bugId, path) + str(index_f) + ".png"
    second_image_path = os.path.join(bugId, path) + str(image_num) + ".png"

    args["first"] = first_image_path
    args[first_image_path] = index_f
    args["second"] = second_image_path
    args[second_image_path] = image_num

def get_image_before(args, key):
    """Returns the path of the image one step before 'first' or 'second' if keyboard is found."""
    image_name = args[key]
    index = args[image_name]
    splitText = str(index) + ".png"
    path = image_name.split(splitText)[0]
    before_image_path = path + str(int(index) - 1) + ".png"
    return before_image_path

def main():
    args = load_arguments()
    bugId = args["bugId"]
    data = read_json(args["bugId"] + f"/Execution-{bugId}.json")
    app_name = args["appName"]

    # We'll store results in a list so we can write them to a PDF afterward
    back_click_results = []

    # Look for device dimensions, steps
    dim = None
    for line in data:
        if "deviceDimensions" in line:
            dim = data["deviceDimensions"]
        if "steps" in line:
            listOfSteps = data["steps"]
            print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    ORACLE FOR BACK BUTTON    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
            triggerScreens = findTrigger(app_name, listOfSteps, dim)
            print("Back was clicked {} time(s)".format(len(triggerScreens)))

    print("-------------------------------------------------------------------------------------------")

    # Evaluate each trigger (back tap)
    for i, trigger in triggerScreens.items():
        get_image_names(args, trigger, i)
        try:
            before_back, after_back = crop_image(args, trigger, i)
        except Exception:
            before_back, after_back = None, None

        if before_back is None or after_back is None:
            continue

        # Compute SSIM
        ssim_val = get_ssim(before_back, after_back)
        missing_frac = ""

        # Check text mismatch if SSIM > 0.8
        if ssim_val > 0.8:
            before_text = imgUtil.read_text_on_screen(args["bugId"], args["first"].split("/")[1])
            after_text = imgUtil.read_text_on_screen(args["bugId"], args["second"].split("/")[1])
            diff = set(before_text) - set(after_text)
            if len(before_text) == 0:
                missing_frac = 0  # avoid division by zero
            else:
                missing_frac = len(diff) / len(before_text)

        # Print to terminal
        print_result(ssim_val, missing_frac)

        # Determine pass/fail (for PDF)
        passed = (ssim_val > 0.8 and missing_frac <= 0.5)
        back_click_results.append({
            "trigger_step": i,
            "ssim_val": round(ssim_val, 3),
            "missing_frac": round(missing_frac, 2) if missing_frac != "" else None,
            "passed": passed
        })

        print("-------------------------------------------------------------------------------------------")

    # Always generate PDF
    pdf_path = os.path.join(bugId, "back_button_report.pdf")
    generate_pdf_report(back_click_results, pdf_path)

# --------------------------------------------------------------------------------
# PDF Generation
# --------------------------------------------------------------------------------
def generate_pdf_report(back_click_results, pdf_path):
    """
    Create a PDF summarizing each back button test:
    - Trigger Step
    - SSIM
    - Text mismatch
    - Pass/Fail
    - Brief summary at the top (total tests, passed, failed)
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import Table, TableStyle
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    x_margin = 50
    y_margin = 50
    y_position = height - y_margin

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x_margin, y_position, "Back Button Behavior Report")
    y_position -= 40

    # If no results, show simple message
    if not back_click_results:
        c.setFont("Helvetica", 12)
        c.drawString(x_margin, y_position, "No back button triggers found.")
        c.save()
        print(f"[INFO] PDF report generated at: {pdf_path}")
        return

    # ------------------ ADDING A BRIEF SUMMARY ------------------
    total_tests = len(back_click_results)
    passed_tests = sum(1 for r in back_click_results if r["passed"])
    failed_tests = total_tests - passed_tests

    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y_position, "Summary:")
    y_position -= 20

    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y_position, f"Total Back-Button Triggers: {total_tests}")
    y_position -= 15
    c.drawString(x_margin, y_position, f"Passed: {passed_tests}")
    y_position -= 15
    c.drawString(x_margin, y_position, f"Failed: {failed_tests}")
    y_position -= 10
    # -----------------------------------------------------------

    # Build Table Data
    table_data = [["Trigger Step", "SSIM", "Text Mismatch", "Result"]]
    for result in back_click_results:
        row = [
            result["trigger_step"],
            str(result["ssim_val"]),
            f"{result['missing_frac']*100}%" if result["missing_frac"] is not None else "N/A",
            "PASSED" if result["passed"] else "FAILED"
        ]
        table_data.append(row)

    # Create a Table
    table = Table(table_data, colWidths=[122, 122, 122, 122])
    table.setStyle(
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

    # Wrap and draw table
    table.wrapOn(c, width, height)
    table_height = 20 * (len(table_data) + 1)
    table.drawOn(c, x_margin, y_position - table_height)

    c.save()

if __name__ == "__main__":
    main()
