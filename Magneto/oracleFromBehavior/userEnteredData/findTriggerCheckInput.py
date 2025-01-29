import json
import sys, os
from pprint import pprint
import argparse

"""
This is the oracle for user-entered text. It finds the screen with trigger words,
reads all the user inputs until the trigger event, and checks for the user input
in the screen after the trigger event is pressed.

Edge cases:
1. Multiple trigger events.
2. User input displayed in a list or substring of larger string.

Input: 19.xml, Execution-12.json, readTextInImage.py
"""

# Location of xmlUtilities.py
scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)
import xmlUtilities

from reportlab.lib.pagesizes import A4
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

detailedResult = True
tracePlayerGenerated = True


def read_json(jsonName):
    with open(jsonName) as f:
        data = json.load(f)
    return data


def load_arguments():
    """construct the argument parse and parse the arguments"""
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="app name")
    ap.add_argument("-b", "--bugId", required=True, help="bug id")
    # Removed the '--pdf' argument, always generating PDF instead
    args = vars(ap.parse_args())
    return args


def find_trigger(listOfSteps, screen_count_map, listOfTriggerWords, listOfTriggerComponents, args):
    """input: steps list from execution.json
    output: list of screen filenames where the trigger clicked"""
    triggerList = []
    for step in listOfSteps:
        if "dynGuiComponent" in step:
            dynGuiComponentData = step["dynGuiComponent"]
            if "idXml" in dynGuiComponentData:
                buttonText = dynGuiComponentData["idXml"].lower()
            else:
                continue
            buttonName = dynGuiComponentData["name"]
            if any(comp == buttonName for comp in listOfTriggerComponents) and any(
                words in buttonText for words in listOfTriggerWords
            ):
                imageNumber = step["sequenceStep"]
                imagePath, imageName = find_xml_from_screenshot(step["screenshot"], imageNumber, args)
                screen_count_map[imageName] = imageNumber
                triggerList.append(imageName)
    return triggerList


def find_xml_from_screenshot(imagename, stepNum, args):
    """Construct XML file name from screenshot, based on whether it's tracePlayerGenerated or not."""
    xmlName = ""
    if tracePlayerGenerated:
        xmlName = imagename.split(".User-Trace")[0]
        versionName = imagename.split("_")[1]
        xmlName += "-" + versionName + "-" + args["bugId"] + "-User-Trace-" + str(stepNum) + ".xml"
    else:
        xmlName = imagename.split("screen")[0]
        xmlName += "ui-dump.xml"
    return os.path.join(args["bugId"], xmlName), xmlName


def find_edit_text(listOfSteps, screen_count_map, args):
    """
    Return: screenTextMap -> {screenIndex -> userEnteredText}
            so we know which screens got user text in them
    """
    screenTextMap = {}
    screen_count_name_map = {}
    for step in listOfSteps:
        if "dynGuiComponent" in step:
            dynGuiComponentData = step["dynGuiComponent"]
            if (
                dynGuiComponentData["name"] == "android.widget.EditText"
                and "none" in step["textEntry"]
            ):
                imageNumber = step["sequenceStep"]
                xmlPath, _ = find_xml_from_screenshot(step["screenshot"], imageNumber, args)
                screen_count_name_map[xmlPath] = imageNumber
                screenTextMap[imageNumber] = dynGuiComponentData["text"]
    return screenTextMap


def process_image_name(imageName, args):
    """
    Example input:
      com.cohenadair.anglerslog.User-Trace.12.com.cohenadair.anglerslog_1441_AnglersLog19_augmented.png
    Output:
      (num, newXmlFilename)
    """
    num = imageName.split(args["appName"])[1].split("_augmented")[0]
    imageName = imageName.split(".User-Trace")[0]
    imageName = imageName + "-" + args["bugId"] + "-12-User-Trace-" + num + ".xml"
    return num, imageName


def read_text_in_screen_after_trigger(screen, textInScreenMap, args):
    """Read text from the XML of 'screen' and store in textInScreenMap."""
    screenName = os.path.join(args["bugId"], screen)
    textList = xmlUtilities.readTextInXml(screenName)
    textInScreenMap[screen] = textList


def create_trigger_component_list():
    listOfTriggerComponents = []
    listOfTriggerComponents.append("android.widget.Button")
    listOfTriggerComponents.append("android.widget.ImageButton")
    listOfTriggerComponents.append("android.widget.TextView")
    return listOfTriggerComponents


def create_trigger_word_list():
    listOfTriggerWords = []
    listOfTriggerWords.append("done")
    listOfTriggerWords.append("set")
    listOfTriggerWords.append("ok")
    listOfTriggerWords.append("save")
    listOfTriggerWords.append("add")
    return listOfTriggerWords


def main():
    args = load_arguments()
    bugId = args["bugId"]
    data = read_json(os.path.join(args["bugId"], f"Execution-{bugId}.json"))

    listOfTriggerWords = create_trigger_word_list()
    listOfTriggerComponents = create_trigger_component_list()
    textInScreenMap = {}
    screen_count_map = {}

    # We'll collect all results into results_for_pdf (to generate PDF at the end)
    results_for_pdf = []

    # Steps
    for line in data:
        if "steps" in line:
            listOfSteps = data["steps"]
            print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ORACLE FOR USER INPUT MATCH %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
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
    for count, trigger in enumerate(triggerScreens):
        print("===========================================================================================")
        print("-------------------------------------------------------------------------------------------")
        print("Result for change", str(count + 1))

        # We read the text from the triggered screen
        read_text_in_screen_after_trigger(trigger, textInScreenMap, args)
        trigger_screen_index = screen_count_map.get(trigger, None)

        # Compare text for every screen between one trigger to the next
        result = compareText(
            usertext_screen_map,
            textInScreenMap,
            trigger,
            trigger_screen_index,
            first_trigger_screen,
        )

        # keep track of last trigger screen if multiple
        first_trigger_screen = trigger_screen_index

        # Display to terminal (unchanged)
        display_result(result)

        # For PDF: figure out missing vs. matched
        missingText = [k for k, v in result.items() if not v]
        passed = True if len(missingText) == 0 else False
        results_for_pdf.append({
            "trigger_index": count + 1,
            "trigger_filename": trigger,
            "missing_inputs": missingText,
            "all_results": result,
            "passed": passed
        })

    # Always generate a PDF
    pdf_path = os.path.join(bugId, "user_input_report.pdf")
    generate_pdf_report(results_for_pdf, pdf_path)


def display_result(result):
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


def compareText(usertext_screen_map, textInScreenMap, trigger, trigger_screen_index, first_trigger_screen):
    """
    For each user text input made between the last trigger and this trigger,
    see if that text appears in the (XML) text of this trigger screen.
    """
    result = {}
    if trigger_screen_index is None:
        return result

    for current_screen_index, text in usertext_screen_map.items():
        if int(first_trigger_screen) < int(current_screen_index) < int(trigger_screen_index):
            entryFlag = False
            for entry in textInScreenMap[trigger]:
                # If entry includes commas/spaces, we check substrings
                if "," in entry or " " in entry:
                    if "," in entry:
                        entry_parts = entry.split(", ")
                    else:
                        entry_parts = entry.split(" ")

                    for e in entry_parts:
                        if text == e:
                            result[text] = True
                            entryFlag = True
                else:
                    if text == entry:
                        result[text] = True
                        entryFlag = True
            if not entryFlag:
                result[text] = False
    return result


def generate_pdf_report(results_for_pdf, pdf_path):
    """
    Generates a PDF with each trigger's pass/fail, missing inputs, etc.
    Also includes a short summary (total triggers, #passed, #failed) at the top.
    """
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    x_margin = 25
    y_margin = 50
    y_position = height - y_margin

    # Title
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_margin, y_position, "User Input Match Report")
    y_position -= 40

    # If no triggers found
    if not results_for_pdf:
        c.setFont("Helvetica", 12)
        c.drawString(x_margin, y_position, "No triggers found, or no data to report.")
        c.save()
        print(f"[INFO] PDF report generated at: {pdf_path}")
        return

    # ------------------ SHORT SUMMARY -------------------
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
    y_position -= 10
    # ---------------------------------------------------

    # Build table data
    table_data = [["Trigger #", "Trigger XML", "Status", "Missing Inputs"]]

    for item in results_for_pdf:
        trigger_num = item["trigger_index"]
        trigger_file = item["trigger_filename"]
        status = "PASSED" if item["passed"] else "FAILED"
        if item["missing_inputs"]:
            missing_str = ", ".join(item["missing_inputs"])
        else:
            missing_str = "--"

        table_data.append([str(trigger_num), trigger_file, status, missing_str])

    # Create table
    col_widths = [60, 290, 60, 140]
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

    # Wrap and draw table
    table.wrapOn(c, width, height)
    table_height = 25 * (len(table_data) + 1)
    table.drawOn(c, x_margin, y_position - table_height)
    y_position -= (table_height + 20)

    c.save()


if __name__ == "__main__":
    main()
