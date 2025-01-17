from unittest import result
import cv2
import numpy as np
import pytesseract
from langdetect import detect_langs
import os, sys, json
import argparse
from pprint import pprint





scriptLocation = os.getcwd()
dirName = os.path.dirname(scriptLocation)
sys.path.insert(1, dirName)
import imageUtilities as imgUtil

"""This code checks the language for only the next screen following language selection"""


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
    if (
        "language" in dynGuiComponentData["currentWindow"].lower()
        and "language" in dynGuiComponentData["titleWindow"].lower()
    ):
        return True
    else:
        return False


def find_trigger(app_name, listOfSteps):
    """input: steps list from execution.json output: finds the screen where language selection should show and the language selected"""
    selection = {}
    language_selected = None
    language_set = False

    for index, step in enumerate(listOfSteps):
        if "dynGuiComponent" in step:
            dynGuiComponentData = step["dynGuiComponent"]
            try:
                result_screen = step["screenshot"].replace("_augmented", "")

                if not language_set:
                    # print("check")
                    language_set = was_language_set(dynGuiComponentData)

                if language_set and not language_selected:
                    # print("found")
                    language_selected = dynGuiComponentData["text"]
                    nextStep = listOfSteps[index + 1]
                    nextActivity = nextStep.get("dynGuiComponent").get("activity")
                    if nextActivity and "launcher" in nextActivity.lower():
                        language_selected = nextStep["dynGuiComponent"]["text"]
                        # print("lang", language_selected)
                        result_screen = nextStep["screenshot"].replace("_augmented", "")

                    # if (
                    #     language_selected == ""
                    #     and "layout" in dynGuiComponentData["name"].lower()
                    # ):
                    #     # language_set = True
                    #     continue
                    # else:
                    if "," in language_selected:
                        language_selected = language_selected.split(",")[0].strip()
                    if "(" in language_selected:
                        language_selected = language_selected.split("(")[0].strip()

                    selection[language_selected] = result_screen
                # if (
                #     "language" in dynGuiComponentData["currentWindow"].lower()
                #     and "language" in dynGuiComponentData["titleWindow"].lower()
                # ):
                #     # language_selected = dynGuiComponentData["text"]
                #     selection[language_selected] = result_screen
            except Exception:
                continue
    return selection


def display_result(val, result_map, selected_lang, total):

    if val > 0.05:
        print(
            "Test failed : {:.2%} of text is not in user selected language".format(val)
        )
        if detailed_result:
            print(
                "===================================== DETAILED RESULT ====================================="
            )

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
    else:
        print(" Test passed : All displayed text is in user selected language ")

    # detailed_result = False


def detect_language(txt, selected_lang, lang_data):

    result_map = {}

    total_count = len(txt)
    for line in txt:
        try:
            for language in Detector(line, quiet=True).languages:
                name = language.name
                code = language.code
                language_info = lang_data[code]
                confidence = language.confidence
                all_names = language_info["name"].split(",") + language_info[
                    "nativeName"
                ].split(",")

                if selected_lang not in all_names and float(confidence) >= 70:
                    result_map[line] = name
        except Exception as e:
            # print(line)
            continue

    return (result_map, total_count)


def main():
    args = load_arguments()
    data = read_json(args["bugId"] + "/Execution-12.json")
    lang_data = read_json("language_code.json")

    app_name = args["appName"]

    for line in data:
        if "steps" in line:
            listOfSteps = data["steps"]
            print(
                "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ORACLE FOR LANGUAGE CHANGE %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
            )
            triggerScreens = find_trigger(app_name, listOfSteps)
            # print(triggerScreens)
    if len(triggerScreens) > 0:
        print("Language was set {} time(s)".format(len(triggerScreens)))
    else:
        print("=== No language change detected ===")

    print(
        "-------------------------------------------------------------------------------------------"
    )
    try:
        for selection, trigger in triggerScreens.items():

            print(
                "==========================================================================================="
            )
            print(
                "-------------------------------------------------------------------------------------------"
            )

            print("Result for", selection, "language selection")

            text_on_screen = imgUtil.read_text_on_screen(args["bugId"], trigger)

            result, total_lines_detected = detect_language(
                text_on_screen, selection, lang_data
            )

            bad_percentage = len(result) / total_lines_detected

            print(
                "---------------------- Was the displayed text in selected language? -----------------------"
            )
            display_result(bad_percentage, result, selection, total_lines_detected)
            print(
                "-------------------------------------------------------------------------------------------"
            )

    except Exception:
        print("Error displaying test result for", selection, "language selection.")


if __name__ == "__main__":
    main()

# print(listOfwords)
# print(newList)
# Website = https://detectlanguage.com/
# import detectlanguage
# detectlanguage.configuration.api_key = "5b26b8f1afc0222493e31eba0b71c9d6"
# print("-------------------------------------------------")
# print(detectlanguage.detect(newList))
# print(detectlanguage.languages())
