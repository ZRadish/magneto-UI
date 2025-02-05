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

# Set up paths so that imageUtilities and labelPredictor can be imported
scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)

import imageUtilities as imgUtil
import labelPredictor

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors

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
original_stdout = sys.stdout
# Redirect prints to both console & buffer
sys.stdout = MultiLogger(original_stdout, console_output_buffer)
# -------------------------------------------------------

detailed_result = True
tracePlayerGenerated = True

def read_json(jsonName):
    with open(jsonName) as f:
        data = json.load(f)
    return data

def load_arguments():
    """Construct the argument parser and parse the arguments."""
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="App name")
    ap.add_argument("-b", "--bugId", required=True, help="Bug ID")
    ap.add_argument("--unzip-dir", required=True, help="Path to the unzipped folder (contains bugId subfolder)")
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
    except Exception:
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
                or (x < (width // 3) and (height - 200) <= y and "tap" in command)
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
    return os.path.join(args["unzip_dir"], args["bugId"], "xmls", xmlName)

def get_image_names(args, imageName, image_num):
    """
    Example:
      input:  (imageName=..., image_num="12")
      sets args["first"] and args["second"] to the relevant paths.
      Now, paths are built using the unzip directory.
    """
    bugId = args["bugId"]
    unzip_dir = args["unzip_dir"]
    # We assume the screenshot name ends with e.g. "12_augmented.png"
    splitText = image_num + "_augmented"
    path = imageName.split(splitText)[0]
    # "first" => 2 steps before
    index_f = int(image_num) - 2
    first_image_path = os.path.join(unzip_dir, bugId, path) + str(index_f) + ".png"
    second_image_path = os.path.join(unzip_dir, bugId, path) + str(image_num) + ".png"

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
    # ----------------------- MAIN LOGIC -----------------------
    args = load_arguments()
    bugId = args["bugId"]
    unzip_dir = args["unzip_dir"]

    # Read JSON
    json_path = os.path.join(unzip_dir, bugId, f"Execution-{bugId}.json")
    data = read_json(json_path)

    # We'll store results in a list to write them to a PDF afterward
    back_click_results = []

    dim = None
    listOfSteps = None
    for line in data:
        if "deviceDimensions" in line:
            dim = data["deviceDimensions"]
        if "steps" in line:
            listOfSteps = data["steps"]
            print("ORACLE FOR BACK BUTTON")
            triggerScreens = findTrigger(args["appName"], listOfSteps, dim)
            print("Back was clicked {} time(s)".format(len(triggerScreens)))

    if not listOfSteps:
        print("No steps found in JSON.")
        sys.exit(0)

    print("-------------------------------------------------------------------------------------------")

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
            before_text = imgUtil.read_text_on_screen(args["first"])
            after_text = imgUtil.read_text_on_screen(args["second"])
            diff = set(before_text) - set(after_text)
            if len(before_text) == 0:
                missing_frac = 0  # avoid division by zero
            else:
                missing_frac = len(diff) / len(before_text)

        # Print to terminal
        print_result(ssim_val, missing_frac)

        # Determine pass/fail (for PDF)
        passed = (ssim_val > 0.8 and (missing_frac == "" or missing_frac <= 0.5))

        back_click_results.append({
            "trigger_step": i,
            "ssim_val": round(ssim_val, 3),
            "missing_frac": (
                round(missing_frac, 2)
                if isinstance(missing_frac, float)
                else None
            ),
            "passed": passed,
            # Store the actual image paths so we can draw them later
            "before_image": args["first"],
            "after_image": args["second"]
        })

        print("-------------------------------------------------------------------------------------------")

    # Now restore stdout and create PDF with console logs + images
    sys.stdout = original_stdout
    console_output = console_output_buffer.getvalue()

    pdf_path = os.path.join(unzip_dir, bugId, "back_button_report.pdf")
    generate_pdf_report(back_click_results, pdf_path, console_output)
    print(f"[INFO] PDF report generated at: {pdf_path}")

# --------------------------------------------------------------------------------
# PDF Generation
# --------------------------------------------------------------------------------
def draw_wrapped_text(canvas, text, x, y, max_width, font='Helvetica', font_size=10, line_height=12):
    """
    Utility to wrap text so it doesn't go off the page.
    Returns the updated y-coordinate.
    """
    from reportlab.pdfbase.pdfmetrics import stringWidth

    canvas.setFont(font, font_size)
    words = text.split()
    current_line = ""

    for w in words:
        candidate = (current_line + " " + w).strip() if current_line else w
        width_of_candidate = stringWidth(candidate, font, font_size)
        if width_of_candidate <= max_width:
            current_line = candidate
        else:
            canvas.drawString(x, y, current_line)
            y -= line_height
            current_line = w

    if current_line:
        canvas.drawString(x, y, current_line)
        y -= line_height

    return y

def generate_pdf_report(back_click_results, pdf_path, console_output):
    """
    1) First page: Entire console output (wrapped).
    2) Second page: summary table of back-click tests.
    3) Then add the images (before/after) for each test at the end.
    """
    from reportlab.lib.pagesizes import A4
    c = canvas.Canvas(pdf_path, pagesize=A4)
    page_width, page_height = A4

    x_margin = 25
    y_margin = 50
    y_position = page_height - y_margin
    line_height = 12

    # --------------- Page 1: Console Logs ---------------
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_margin, y_position, "Back Button - Console Logs")
    y_position -= 20

    max_text_width = page_width - 2 * x_margin

    for line in console_output.split("\n"):
        y_position = draw_wrapped_text(
            c, line, x_margin, y_position,
            max_width=max_text_width,
            font='Helvetica', font_size=10,
            line_height=line_height
        )
        if y_position < 60:
            c.showPage()
            c.setFont("Helvetica", 10)
            y_position = page_height - y_margin

    # --------------- Page 2: Summary Table ---------------
    c.showPage()
    y_position = page_height - y_margin
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_margin, y_position, "Back Button - Summary Table")
    y_position -= 30

    if not back_click_results:
        c.setFont("Helvetica", 12)
        c.drawString(x_margin, y_position, "No back button triggers found.")
        c.save()
        return

    total_tests = len(back_click_results)
    passed_tests = sum(1 for r in back_click_results if r["passed"])
    failed_tests = total_tests - passed_tests

    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y_position, f"Total: {total_tests},  Passed: {passed_tests},  Failed: {failed_tests}")
    y_position -= 20

    from reportlab.platypus import Table, TableStyle
    from reportlab.lib import colors

    table_data = [["Trigger Step", "SSIM", "Text Mismatch (%)", "Result"]]
    for r in back_click_results:
        mismatch_str = f"{r['missing_frac']*100}%" if r["missing_frac"] is not None else "N/A"
        row = [
            r["trigger_step"],
            str(r["ssim_val"]),
            mismatch_str,
            "PASSED" if r["passed"] else "FAILED"
        ]
        table_data.append(row)

    summary_table = Table(table_data, colWidths=[110, 80, 110, 80])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))

    # wrap & draw
    tw, th = summary_table.wrap(0, 0)
    summary_table.drawOn(c, x_margin, y_position - th)
    y_position -= (th + 30)

    # --------------- Pages 3+ : Before/After Images ---------------
    for r in back_click_results:
        before_path = r["before_image"]
        after_path = r["after_image"]

        # If not enough space for next images on this page, start a new one
        if y_position - 250 < 50:
            c.showPage()
            y_position = page_height - y_margin

        # Label
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x_margin, y_position, f"Trigger Step: {r['trigger_step']}")
        y_position -= 15

        # Show "Before" image
        if before_path and os.path.exists(before_path):
            c.setFont("Helvetica", 10)
            c.drawString(x_margin, y_position, "Before:")
            y_position -= 15
            c.drawImage(before_path, x_margin, y_position - 200, width=200, height=200, preserveAspectRatio=True)
        else:
            c.setFont("Helvetica", 10)
            c.drawString(x_margin, y_position, "(Before image not found)")
        y_position -= 220

        # Show "After" image
        if after_path and os.path.exists(after_path):
            c.setFont("Helvetica", 10)
            c.drawString(x_margin, y_position, "After:")
            y_position -= 15
            c.drawImage(after_path, x_margin, y_position - 200, width=200, height=200, preserveAspectRatio=True)
            y_position -= 220
        else:
            c.setFont("Helvetica", 10)
            c.drawString(x_margin, y_position, "(After image not found)")
            y_position -= 20

        # Extra spacing between pairs
        y_position -= 30

        # If near bottom of page, new page
        if y_position < 100:
            c.showPage()
            y_position = page_height - y_margin

    c.save()

# ------------------ Entry Point ------------------
if __name__ == "__main__":
    main()