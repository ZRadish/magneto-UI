import os, sys, json
import argparse
import cv2
import numpy as np
import pytesseract
from langdetect import detect_langs
from polyglot.detect import Detector
from pprint import pprint

from reportlab.lib.pagesizes import A4
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

import io

scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)
import imageUtilities as imgUtil

"""This code checks the language for all the screens following language selection."""

detailed_result = True

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

def load_arguments():
    """Construct the argument parser and parse the arguments."""
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="App name")
    ap.add_argument("-b", "--bugId", required=True, help="Bug ID")
    ap.add_argument("--unzip-dir", required=True, help="Path to the unzipped folder (contains bugId subfolder)")
    args = vars(ap.parse_args())
    return args

def read_json(json_path):
    with open(json_path) as f:
        return json.load(f)

def was_language_set(dynGuiComponentData):
    """Checks if the current window indicates language selection."""
    if (
        "language" in dynGuiComponentData["currentWindow"].lower()
        and "language" in dynGuiComponentData["titleWindow"].lower()
    ):
        return True
    else:
        return False

def find_trigger(app_name, listOfSteps):
    """
    Input: steps list from execution.json
    Output: dict of { 'English': [screen1, screen2, ...], 'Spanish': [...], ... }
    """
    selection = {}
    language_selected = None
    language_set = False
    for index, step in enumerate(listOfSteps):
        if "dynGuiComponent" in step:
            dynGuiComponentData = step["dynGuiComponent"]
            try:
                result_screen = step["screenshot"].replace("_augmented", "")
                if not language_set:
                    language_set = was_language_set(dynGuiComponentData)
                if language_set and language_selected:
                    selection[language_selected].append(result_screen)
                if language_set and not language_selected:
                    # The user is presumably picking the language here
                    language_selected = dynGuiComponentData["text"]
                    nextStep = listOfSteps[index + 1] if index + 1 < len(listOfSteps) else None
                    if nextStep:
                        nextComp = nextStep.get("dynGuiComponent", {})
                        nextActivity = nextComp.get("activity", "")
                        temp_selection = nextComp.get("text", "")
                        if nextActivity and "launcher" in nextActivity.lower() and temp_selection != '':
                            language_selected = temp_selection
                    # Cleanup language string
                    if language_selected == '':
                        language_set = False
                        break
                    if "," in language_selected:
                        language_selected = language_selected.split(",")[0].strip()
                    if "(" in language_selected:
                        language_selected = language_selected.split("(")[0].strip()
                    selection[language_selected] = []
            except Exception:
                continue
    return selection

def display_result(val, result_map, selected_lang, total, trigger):
    if val > 0.05:
        print(
            "Test failed : {:.2%} of text in".format(val),
            trigger,
            "is not in user selected language",
        )
    else:
        print("Test passed : All displayed text is in user selected language")

    if detailed_result:
        print("===================================== DETAILED RESULT =====================================")
        print("Text : detected language")
        pprint(result_map)
        print(
            len(result_map),
            "of",
            total,
            "text groups weren't in",
            selected_lang,
            "language",
        )
        print(
            "The test result is based on ratio of un-translated sentences to all language identified sentences. The threshold for good conversion is 70%"
        )
        print(
            "'Detector is not able to detect the language reliably.' message is shown if the text to be translated was too small for reliable translation."
        )

def detect_language(txt, selected_lang, lang_data):
    """
    Attempt to detect the language for each text line.
    If it doesn't match the user-selected language, record it.
    Returns: (result_map, total_count)
      result_map: {line: detected_language} for lines not matching
      total_count: how many lines we attempted to detect
    """
    from polyglot.detect import Detector
    result_map = {}
    total_count = len(txt)
    for line in txt:
        try:
            # Use Polyglot to detect possible languages
            detector = Detector(line, quiet=True)
            for language in detector.languages:
                name = language.name
                code = language.code
                confidence = language.confidence
                language_info = lang_data.get(code, {})

                # Combine name and nativeName
                all_names = []
                if "name" in language_info:
                    all_names += language_info["name"].split(",")
                if "nativeName" in language_info:
                    all_names += language_info["nativeName"].split(",")

                # Cleanup trailing spaces
                all_names = [n.strip() for n in all_names if n.strip()]

                # If the selected language isn't in the possible names,
                # and confidence is >= 70, treat it as a mismatch
                if selected_lang not in all_names and float(confidence) >= 70:
                    result_map[line] = name
        except Exception:
            # If detection fails, skip
            continue

    return (result_map, total_count)

def main():
    args = load_arguments()
    bugId = args["bugId"]
    unzip_dir = args["unzip_dir"]

    # Read the main JSON that has the steps
    json_path = os.path.join(unzip_dir, bugId, f"Execution-{bugId}.json")
    data = read_json(json_path)

    # Read the language code JSON (assumes it is in the same folder or use an absolute path)
    lang_data = read_json("language_code.json")

    print("ORACLE FOR LANGUAGE CHANGE")
    triggerScreens = {}
    listOfSteps = None

    # Parse 'deviceDimensions' or 'steps' from the JSON
    for line in data:
        if "steps" in line:
            listOfSteps = data["steps"]
            triggerScreens = find_trigger(args["appName"], listOfSteps)
    if len(triggerScreens) > 0:
        print("Language was set {} time(s)".format(len(triggerScreens)))
    else:
        print("=== No language change detected ===")

    # We'll collect results for each language in a structured form
    pdf_summary = {
        "lang_changes": []
    }

    # For each language found, gather the screens and check them
    for selection, triggers in triggerScreens.items():
        lang_result = {
            "selected_lang": selection,
            "results": []  # each item: { 'screen': str, 'bad_percentage': float, 'num_lines': int, 'num_mismatched': int }
        }

        print("===========================================================================================")
        print("Result for", selection, "language selection")

        for trigger in triggers:
            # We'll store the actual screenshot path to embed in the PDF
            screenshot_file = f"{trigger}.png"  # or some known naming pattern
            full_path = os.path.join(unzip_dir, bugId, screenshot_file)
            screenshot_path = os.path.join(unzip_dir, bugId)
            text_on_screen = imgUtil.read_text_on_screen(screenshot_path, trigger)
            if not text_on_screen:
                print("Test passed : No text found in image", trigger)
                lang_result["results"].append({
                    "screen": trigger,
                    "screenshot": full_path,  # store the actual image path here
                    "bad_percentage": bad_percentage,
                    "num_lines": total_lines_detected,
                    "num_mismatched": len(result_map),
                })
                continue

            result_map, total_lines_detected = detect_language(text_on_screen, selection, lang_data)
            bad_percentage = len(result_map) / total_lines_detected if total_lines_detected > 0 else 0.0

            print("---------------------- Was the displayed text in selected language? -----------------------")
            display_result(bad_percentage, result_map, selection, total_lines_detected, trigger)
            print("-------------------------------------------------------------------------------------------")

            lang_result["results"].append({
                "screen": trigger,
                "bad_percentage": bad_percentage,
                "num_lines": total_lines_detected,
                "num_mismatched": len(result_map),
                "screenshot": full_path 
            })

        pdf_summary["lang_changes"].append(lang_result)

    # Restore stdout and build the PDF with logs + images
    sys.stdout = original_stdout
    console_output = console_output_buffer.getvalue()

    pdf_path = os.path.join(unzip_dir, bugId, "language_detection_report.pdf")
    generate_pdf_report(pdf_summary, pdf_path, console_output)
    print(f"[INFO] PDF generated at: {pdf_path}")


# ----------------------------------------------------------------
# HELPER FUNCTION FOR WRAPPING TEXT (console logs) IN THE PDF
# ----------------------------------------------------------------
def draw_wrapped_text(canvas, text, x, y, max_width, font='Helvetica', font_size=10, line_height=12):
    """
    Draw 'text' at (x,y), wrapping automatically if the line exceeds 'max_width'.
    Returns the new 'y' position after drawing.
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


# ----------------------------------------------------------------
# PDF GENERATION (CONSOLE LOGS first, then summary table, then images)
# ----------------------------------------------------------------
def generate_pdf_report(summary, pdf_path, console_output):
    """
    1) Page 1: Entire console logs (wrapped).
    2) Page 2: Summary table for language checks.
    3) Pages after that: each screenshot is displayed at 200x200, labeled with the language and screen name.
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import Table, TableStyle
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas

    c = canvas.Canvas(pdf_path, pagesize=A4)
    page_width, page_height = A4

    x_margin = 25
    y_margin = 50
    y_position = page_height - y_margin
    line_height = 12

    # -------------------- Page 1: Console Logs --------------------
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_margin, y_position, "Language Detection - Console Logs")
    y_position -= 20

    max_text_width = page_width - 2 * x_margin

    for line in console_output.split("\n"):
        y_position = draw_wrapped_text(
            c, line, x_margin, y_position,
            max_width=max_text_width,
            font='Helvetica', font_size=10,
            line_height=line_height
        )
        if y_position < 60:  # If near bottom, new page
            c.showPage()
            c.setFont("Helvetica", 10)
            y_position = page_height - y_margin

    # -------------------- Page 2: Summary Table(s) --------------------
    c.showPage()
    y_position = page_height - y_margin

    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_margin, y_position, "Language Detection - Summary")
    y_position -= 30

    # If no language changes, just note that
    if not summary["lang_changes"]:
        c.setFont("Helvetica", 12)
        c.drawString(x_margin, y_position, "No language changes detected.")
        c.save()
        return

    # Count total screens
    total_screens = sum(len(lc["results"]) for lc in summary["lang_changes"])
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x_margin, y_position, f"Total language selections: {len(summary['lang_changes'])}, total screens: {total_screens}")
    y_position -= 20

    for lang_change in summary["lang_changes"]:
        selected_lang = lang_change["selected_lang"]
        results = lang_change["results"]

        c.setFont("Helvetica-Bold", 12)
        c.drawString(x_margin, y_position, f"Language: {selected_lang}")
        y_position -= 20

        table_data = [["Screen", "Total Lines", "Mismatch", "Bad %"]]
        for r in results:
            bad_pct = round(r["bad_percentage"] * 100, 2)
            mismatch_count = r["num_mismatched"]
            lines_count = r["num_lines"]
            table_data.append([
                r["screen"],
                str(lines_count),
                str(mismatch_count),
                f"{bad_pct}%"
            ])

        summary_table = Table(table_data, colWidths=[350, 80, 80, 80])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))

        # Wrap and draw
        tw, th = summary_table.wrap(0, 0)
        summary_table.drawOn(c, x_margin, y_position - th)
        y_position -= (th + 30)

        # If near bottom, next page
        if y_position < 100:
            c.showPage()
            y_position = page_height - y_margin

    # -------------------- Pages 3+: Screenshots --------------------
    for lang_change in summary["lang_changes"]:
        selected_lang = lang_change["selected_lang"]
        for r in lang_change["results"]:
            screen_name = r["screen"]
            screenshot_path = r["screenshot"]

            # Check if we have enough space
            if y_position - 220 < 50:  # about 200 for the image + margin
                c.showPage()
                y_position = page_height - y_margin

            # Label
            c.setFont("Helvetica-Bold", 12)
            c.drawString(x_margin, y_position, f"Language: {selected_lang}, Screen: {screen_name}")
            y_position -= 15

            # Draw the image if it exists
            if os.path.exists(screenshot_path):
                c.drawImage(
                    screenshot_path,
                    x_margin,
                    y_position - 200,
                    width=200,
                    height=200,
                    preserveAspectRatio=True
                )
                y_position -= (200 + 30)
            else:
                c.setFont("Helvetica", 10)
                c.drawString(x_margin, y_position, f"(Screenshot not found: {screenshot_path})")
                y_position -= 30

            # If near bottom, next page
            if y_position < 100:
                c.showPage()
                y_position = page_height - y_margin

    # Finalize
    c.save()

# ------------------ Entry Point ------------------
if __name__ == "__main__":
    main()