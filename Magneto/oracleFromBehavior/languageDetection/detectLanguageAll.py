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

scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)
import imageUtilities as imgUtil

"""This code checks the language for all the screens following language selection."""

detailed_result = True

def load_arguments():
    """construct the argument parse and parse the arguments"""
    ap = argparse.ArgumentParser()
    ap.add_argument("-a", "--appName", required=True, help="second")
    ap.add_argument("-b", "--bugId", required=True, help="first input image")
    args = vars(ap.parse_args())
    return args

def read_json(jsonName):
    with open(jsonName) as f:
        data = json.load(f)
    return data

def was_language_set(dynGuiComponentData):
    # Checks if the current window indicates language selection
    if (
        "language" in dynGuiComponentData["currentWindow"].lower()
        and "language" in dynGuiComponentData["titleWindow"].lower()
    ):
        return True
    else:
        return False

def find_trigger(app_name, listOfSteps):
    """
    input: steps list from execution.json
    output: dict of { 'English': [screen1, screen2, ...], 'Spanish': [...], ... }
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
        print(" Test passed : All displayed text is in user selected language ")
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
    result_map = {}
    total_count = len(txt)
    for line in txt:
        try:
            # Use Polyglot to detect possible languages
            for language in Detector(line, quiet=True).languages:
                name = language.name
                code = language.code
                language_info = lang_data.get(code, {})
                confidence = language.confidence

                # Combine name and nativeName
                all_names = []
                if "name" in language_info:
                    all_names += language_info["name"].split(",")
                if "nativeName" in language_info:
                    all_names += language_info["nativeName"].split(",")

                all_names = [n.strip() for n in all_names]

                # If the selected language isn't in the possible names,
                # and confidence is >=70, treat it as a mismatch
                if selected_lang not in all_names and float(confidence) >= 70:
                    result_map[line] = name
        except Exception:
            continue

    return (result_map, total_count)

def main():
    args = load_arguments()
    bugId = args["bugId"]
    data = read_json(args["bugId"] + f"/Execution-{bugId}.json")
    lang_data = read_json("language_code.json")  # Contains code-> {name, nativeName}

    app_name = args["appName"]
    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ORACLE FOR LANGUAGE CHANGE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    triggerScreens = {}
    for line in data:
        if "steps" in line:
            listOfSteps = data["steps"]
            triggerScreens = find_trigger(app_name, listOfSteps)
    if len(triggerScreens) > 0:
        print("Language was set {} time(s)".format(len(triggerScreens)))
    else:
        print("=== No language change detected ===")

    print("-------------------------------------------------------------------------------------------")

    # We'll collect PDF data in a single structure:
    # { 
    #   'lang_changes': [ 
    #       { 'selected_lang': 'English', 'results': [ 
    #             { 'screen': 'screenshot1.png', 'bad_percentage': 0.03, 'num_lines': 30, 'num_mismatched': 1 }, ... 
    #         ] 
    #       }, ...
    #   ]
    # }
    pdf_summary = {
        "lang_changes": []
    }

    # For each language found, gather the screens and check them
    for selection, triggers in triggerScreens.items():
        lang_result = { "selected_lang": selection, "results": [] }

        print("===========================================================================================")
        print("-------------------------------------------------------------------------------------------")
        print("Result for", selection, "language selection")

        for trigger in triggers:
            text_on_screen = imgUtil.read_text_on_screen(args["bugId"], trigger)
            if not text_on_screen:
                print(" Test passed : No text found in image")
                # Even if no text, store something in PDF results
                lang_result["results"].append({
                    "screen": trigger,
                    "bad_percentage": 0.0,
                    "num_lines": 0,
                    "num_mismatched": 0
                })
                continue

            result_map, total_lines_detected = detect_language(text_on_screen, selection, lang_data)
            bad_percentage = len(result_map) / total_lines_detected if total_lines_detected > 0 else 0.0

            print("---------------------- Was the displayed text in selected language? -----------------------")
            display_result(bad_percentage, result_map, selection, total_lines_detected, trigger)
            print("-------------------------------------------------------------------------------------------")

            # Store results for PDF
            lang_result["results"].append({
                "screen": trigger,
                "bad_percentage": bad_percentage,
                "num_lines": total_lines_detected,
                "num_mismatched": len(result_map)
            })

        pdf_summary["lang_changes"].append(lang_result)

    # Always generate PDF (no new argument, so we just do it at the end)
    pdf_path = os.path.join(bugId, "language_detection_report.pdf")
    generate_pdf_report(pdf_summary, pdf_path)

def generate_pdf_report(summary, pdf_path):
    """
    Create a single-page PDF summarizing language checks.
    The page height grows if needed (similar to the theme-check approach).
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import Table, TableStyle
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas

    # 1) Basic margin & spacing setup
    top_margin = 40
    left_margin = 17
    line_gap_title = 30
    line_gap_subtitle = 20
    spacer_between_items = 30

    # We'll measure everything first.
    total_height = top_margin

    # Title line
    total_height += line_gap_title

    # ------------------- ADDING a short summary at the top -------------------
    # For example: total number of language selections, total screens tested...
    # We'll count them:
    total_lang_changes = len(summary["lang_changes"])
    total_screens = 0
    for lang_change in summary["lang_changes"]:
        total_screens += len(lang_change["results"])

    # Reserve space for 3 lines of summary text
    summary_lines = 3  
    total_height += summary_lines * 15  # each line ~15 points of vertical space
    # ------------------------------------------------------------------------

    # For each language change, measure sub-title + table
    for lang_change in summary["lang_changes"]:
        total_height += line_gap_subtitle
        num_screens = len(lang_change["results"])
        total_height += 20 * (num_screens + 1)
        total_height += spacer_between_items

    # At least the default A4 height if content is small
    a4_width, a4_height = A4
    final_page_height = max(a4_height, total_height)

    # 2) Create the canvas
    c = canvas.Canvas(pdf_path, pagesize=(a4_width, final_page_height))
    y_position = final_page_height - top_margin

    # 3) Draw the Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(left_margin, y_position, "Language Detection Report")
    y_position -= line_gap_title

    # ------------------- DRAWING THE SHORT SUMMARY -------------------
    c.setFont("Helvetica-Bold", 12)
    c.drawString(left_margin, y_position, "Summary:")
    y_position -= 15

    c.setFont("Helvetica", 10)
    c.drawString(left_margin, y_position, f"Total Language Selections: {total_lang_changes}")
    y_position -= 15
    c.drawString(left_margin, y_position, f"Total Screens Analyzed: {total_screens}")
    y_position -= 15
    # -----------------------------------------------------------------

    y_position -= line_gap_subtitle  # some spacing after summary block

    # 4) For each language changed, draw a sub-title and a table
    for lang_change in summary["lang_changes"]:
        selected_lang = lang_change["selected_lang"]
        results = lang_change["results"]

        # Sub-title
        c.setFont("Helvetica-Bold", 12)
        c.drawString(left_margin, y_position, f"Results for '{selected_lang}' language selection:")
        y_position -= line_gap_subtitle

        # Build table data
        table_data = [["Screen", "Total Lines", "Mismatched", "Bad %"]]
        for r in results:
            scr = r["screen"]
            lines_total = r["num_lines"]
            lines_mismatch = r["num_mismatched"]
            bad_percentage = round(r["bad_percentage"] * 100, 2)
            table_data.append([
                scr,
                str(lines_total),
                str(lines_mismatch),
                f"{bad_percentage}%"
            ])

        # Create the table
        col_widths = [180, 80, 80, 80]
        table = Table(table_data, colWidths=col_widths)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ]
            )
        )

        # Wrap & measure
        tw, th = table.wrap(a4_width, final_page_height)
        # Draw
        table.drawOn(c, left_margin, y_position - th)
        y_position -= (th + spacer_between_items)

    # 5) Finalize
    c.save()

if __name__ == "__main__":
    main()
