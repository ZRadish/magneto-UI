import json
import sys, os
from pprint import pprint
import argparse
import io

from reportlab.lib.pagesizes import A4
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# ---------- MultiLogger for Terminal + Buffer ----------
class MultiLogger:
    """
    A small class to direct 'print' outputs to both the console and a StringIO buffer.
    This way, we can see logs in the terminal AND capture them for the PDF.
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


# We'll capture console output in this buffer for later PDF printing
console_output_buffer = io.StringIO()

# Keep reference to the original stdout (the real console)
original_stdout = sys.stdout

# Redirect all 'print()' calls to both console and buffer
sys.stdout = MultiLogger(original_stdout, console_output_buffer)

"""
This is the oracle for user-entered text. It finds screens with trigger words,
reads the user inputs until the trigger event, and checks for the user input
in the screen after the trigger event is pressed.

Edge cases:
1. Multiple trigger events.
2. User input displayed in a list or substring of a larger string.
"""

# We assume xmlUtilities is in the parent folder
scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)
import xmlUtilities

detailedResult = True
tracePlayerGenerated = True

def read_json(jsonName):
    with open(jsonName) as f:
        data = json.load(f)
    return data

def load_arguments():
    """
    Construct the argument parser and parse arguments:
    - --appName, --bugId, --unzip-dir
    """
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="App name")
    ap.add_argument("-b", "--bugId", required=True, help="Bug ID")
    # New argument for the unzipped folder path (which should contain the bugId subfolder)
    ap.add_argument("--unzip-dir", required=True, help="Path to the unzipped folder (contains bugId subfolder)")
    args = vars(ap.parse_args())
    return args

def create_trigger_component_list():
    return ["android.widget.Button", "android.widget.ImageButton", "android.widget.TextView"]

def create_trigger_word_list():
    return ["done", "set", "ok", "save", "add"]

def find_trigger(listOfSteps, screen_count_map, listOfTriggerWords, listOfTriggerComponents, args):
    """
    Return a list of tuples: (triggerXMLName, screenshotName)
    for each 'trigger' event we find.
    """
    triggerList = []
    for step in listOfSteps:
        if "dynGuiComponent" in step:
            dynGuiComponentData = step["dynGuiComponent"]
            if "idXml" in dynGuiComponentData:
                buttonText = dynGuiComponentData["idXml"].lower()
            else:
                continue

            buttonName = dynGuiComponentData["name"]
            # If matches a "trigger" widget + has the trigger word
            if any(comp == buttonName for comp in listOfTriggerComponents) and any(
                words in buttonText for words in listOfTriggerWords
            ):
                imageNumber = step["sequenceStep"]
                # We get the XML name from the screenshot
                xmlFullPath, xmlName = find_xml_from_screenshot(step["screenshot"], imageNumber, args)
                screen_count_map[xmlName] = imageNumber
                # Also store the screenshot itself for potential PDF usage
                triggerList.append((xmlName, step["screenshot"]))
    return triggerList

def find_xml_from_screenshot(imagename, stepNum, args):
    """
    Construct XML file name from screenshot, based on whether it's tracePlayerGenerated or not,
    and prepend the --unzip-dir + bugId folder.
    """
    if tracePlayerGenerated:
        # Example: imagename = "MyApp_12345.User-Trace.png"
        base = imagename.split(".User-Trace")[0]
        versionName = imagename.split("_")[1]  # e.g. 12345
        # e.g. base + "-12345-<bugId>-User-Trace-<stepNum>.xml"
        xmlName = f"{base}-{versionName}-{args['bugId']}-User-Trace-{stepNum}.xml"
    else:
        # Fallback approach if not tracePlayerGenerated
        base = imagename.split("screen")[0]
        xmlName = base + "ui-dump.xml"

    # Full path includes the unzip_dir and bugId subfolder
    return (
        os.path.join(args["unzip_dir"], args["bugId"], xmlName),  # full path
        xmlName  # just the filename (for table display, etc.)
    )

def find_edit_text(listOfSteps, screen_count_map, args):
    """
    Return: {screenIndex -> userEnteredText} so we know which screens had user text input.
    """
    screenTextMap = {}
    for step in listOfSteps:
        if "dynGuiComponent" in step:
            dynGuiComponentData = step["dynGuiComponent"]
            # Check if user typed something in an EditText
            if (
                dynGuiComponentData["name"] == "android.widget.EditText"
                and "none" in step["textEntry"]
            ):
                imageNumber = step["sequenceStep"]
                xmlPath, _ = find_xml_from_screenshot(step["screenshot"], imageNumber, args)
                screenTextMap[imageNumber] = dynGuiComponentData["text"]
    return screenTextMap

def read_text_in_screen_after_trigger(screenXmlName, textInScreenMap, args):
    """
    Parse text from the screen XML (full path) and store it in textInScreenMap[screenXmlName].
    """
    fullXmlPath = os.path.join(args["unzip_dir"], args["bugId"], screenXmlName)
    textList = xmlUtilities.readTextInXml(fullXmlPath)
    textInScreenMap[screenXmlName] = textList

def display_result(result):
    """
    Print pass/fail in the terminal and show detailed user inputs if needed.
    """
    if not result:
        print("Test passed: no user input set")
    else:
        missingText = [k for k, v in result.items() if not v]
        if missingText:
            print("Test failed : missing user input")
        else:
            print("Test passed : all user input shown")

        if detailedResult:
            print("===================================== DETAILED RESULT =====================================")
            print("User input : is it on screen?")
            pprint(result)

    print("-------------------------------------------------------------------------------------------")

def compareText(usertext_screen_map, textInScreenMap, triggerXmlName, trigger_screen_index, first_trigger_screen):
    """
    For each user text input made between the last trigger and this trigger,
    see if that text appears in the (XML) text of this trigger screen.
    """
    result = {}
    if trigger_screen_index is None:
        return result

    # Go through each user input's "screen index"
    for current_screen_index, text in usertext_screen_map.items():
        # Only check text typed after the last trigger, but before this trigger
        if int(first_trigger_screen) < int(current_screen_index) < int(trigger_screen_index):
            entryFlag = False
            # Compare against all text in the trigger screen
            for entry in textInScreenMap[triggerXmlName]:
                # If entry includes commas/spaces, check them individually
                if "," in entry or " " in entry:
                    # Remove commas, then split
                    entry_parts = entry.replace(",", "").split()
                    if text in entry_parts:
                        result[text] = True
                        entryFlag = True
                else:
                    if text == entry:
                        result[text] = True
                        entryFlag = True

            # If we never matched it, it's missing
            if not entryFlag:
                result[text] = False

    return result

def main():
    args = load_arguments()
    bugId = args["bugId"]
    unzip_dir = args["unzip_dir"]

    # Read JSON from: <unzip_dir>/<bugId>/Execution-<bugId>.json
    execution_json_path = os.path.join(unzip_dir, bugId, f"Execution-{bugId}.json")
    data = read_json(execution_json_path)

    listOfTriggerWords = create_trigger_word_list()
    listOfTriggerComponents = create_trigger_component_list()

    textInScreenMap = {}
    screen_count_map = {}

    # We'll store results in this list so we can generate PDF at the end
    results_for_pdf = []

    # The JSON presumably has a "steps" section
    for line in data:
        if "steps" in line:
            listOfSteps = data["steps"]
            print("ORACLE FOR USER INPUT MATCH")

            # find_trigger will return a list of (xmlName, screenshotFile)
            triggerScreens = find_trigger(
                listOfSteps,
                screen_count_map,
                listOfTriggerWords,
                listOfTriggerComponents,
                args,
            )

            if triggerScreens:
                print("User input detected")
            else:
                print("=== No user input detected ===")

            usertext_screen_map = find_edit_text(listOfSteps, screen_count_map, args)

    first_trigger_screen = 0
    print("-------------------------------------------------------------------------------------------")

    # Evaluate each trigger
    for count, (triggerXmlName, triggerScreenshot) in enumerate(triggerScreens):
        print("===========================================================================================")
        print("-------------------------------------------------------------------------------------------")
        print("Result for change", str(count + 1))

        # Read text from the triggered screen
        read_text_in_screen_after_trigger(triggerXmlName, textInScreenMap, args)
        trigger_screen_index = screen_count_map.get(triggerXmlName, None)

        # Compare text for every screen between one trigger and the next
        result = compareText(
            usertext_screen_map,
            textInScreenMap,
            triggerXmlName,
            trigger_screen_index,
            first_trigger_screen,
        )

        # Keep track of last trigger screen if multiple triggers
        first_trigger_screen = trigger_screen_index

        # Print results in terminal
        display_result(result)

        # For PDF: figure out missing vs matched
        missingText = [k for k, v in result.items() if not v]
        passed = (len(missingText) == 0)

        # Collect all info for PDF
        results_for_pdf.append({
            "trigger_index": count + 1,
            "trigger_filename": triggerXmlName,
            "missing_inputs": missingText,
            "all_results": result,
            "passed": passed,
            "screenshot_file": triggerScreenshot,
        })

    # Restore real stdout to fetch everything from console_output_buffer
    sys.stdout = original_stdout
    console_output = console_output_buffer.getvalue()

    # Generate PDF into the bug folder under unzip_dir
    pdf_path = os.path.join(unzip_dir, bugId, "user_input_report.pdf")
    generate_pdf_report(results_for_pdf, pdf_path, console_output, args)
    print(f"\n[INFO] PDF generated at: {pdf_path}")


def generate_pdf_report(results_for_pdf, pdf_path, console_output, args):
    """
    1) Print the entire console output (captured) into the PDF at the top.
    2) Summaries and table of results on a new page.
    3) Attach small screenshots for all failed triggers at the end.
    """
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    x_margin = 25
    y_margin = 50
    y_position = height - y_margin

    # ============ Title ============
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_margin, y_position, "User Input Match Report")
    y_position -= 20

    # ============ Console Output ============
    c.setFont("Helvetica", 10)
    line_height = 12
    for line in console_output.split("\n"):
        c.drawString(x_margin, y_position, line)
        y_position -= line_height
        if y_position < 50:
            c.showPage()
            c.setFont("Helvetica", 10)
            y_position = height - y_margin

    # ============ New Page for Summary Table ============
    c.showPage()
    y_position = height - y_margin

    # If no triggers found
    if not results_for_pdf:
        c.setFont("Helvetica", 12)
        c.drawString(x_margin, y_position, "No triggers found, or no data to report.")
        c.save()
        return

    # Summaries
    total_triggers = len(results_for_pdf)
    passed_triggers = sum(1 for item in results_for_pdf if item["passed"])
    failed_triggers = total_triggers - passed_triggers

    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y_position, "Summary:")
    y_position -= 20

    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y_position, f"Total Triggers: {total_triggers}")
    y_position -= 15
    c.drawString(x_margin, y_position, f"Passed: {passed_triggers}")
    y_position -= 15
    c.drawString(x_margin, y_position, f"Failed: {failed_triggers}")
    y_position -= 25

    # ============ Table of results ============
    table_data = [["Trigger #", "Trigger XML", "Status", "Missing Inputs"]]
    for item in results_for_pdf:
        trigger_num = item["trigger_index"]
        trigger_file = item["trigger_filename"]
        status = "PASSED" if item["passed"] else "FAILED"
        missing_str = ", ".join(item["missing_inputs"]) if item["missing_inputs"] else "--"
        table_data.append([str(trigger_num), trigger_file, status, missing_str])

    col_widths = [60, 280, 60, 140]
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ])
    )

    table.wrapOn(c, width, y_position)
    table_height = 20 * (len(table_data) + 1)
    table.drawOn(c, x_margin, y_position - table_height)
    y_position -= (table_height + 30)

    # ============ Screenshots for FAILED tests ============
    failed_items = [item for item in results_for_pdf if not item["passed"]]
    if failed_items:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x_margin, y_position, "Failed Test Screenshots:")
        y_position -= 25

        c.setFont("Helvetica", 10)

        for item in failed_items:
            trigger_num = item["trigger_index"]
            screenshot_name = item["screenshot_file"]  # e.g. "someScreenshot.png"
            # Build full path: unzip_dir/bugId/<screenshot>
            screenshot_path = os.path.join(args["unzip_dir"], args["bugId"], screenshot_name)

            # Label for this screenshot
            c.drawString(x_margin, y_position, f"Trigger #{trigger_num} : {screenshot_name}")
            y_position -= 15

            if os.path.isfile(screenshot_path):
                img_width = 200
                img_height = 200

                # If near bottom, do a page break
                if y_position - img_height < 50:
                    c.showPage()
                    c.setFont("Helvetica", 10)
                    y_position = height - y_margin

                c.drawImage(
                    screenshot_path,
                    x_margin,
                    y_position - img_height,
                    width=img_width,
                    height=img_height,
                    preserveAspectRatio=True
                )
                y_position -= (img_height + 30)
            else:
                c.drawString(x_margin, y_position, "[Screenshot file not found]")
                y_position -= 20

            # Additional spacing or next page check
            if y_position < 50:
                c.showPage()
                c.setFont("Helvetica", 10)
                y_position = height - y_margin

    c.save()


if __name__ == "__main__":
    main()