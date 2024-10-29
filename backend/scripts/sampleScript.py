# scripts/sampleScript.py
import sys

def main():
    print("Hello from Python script!")
    # # Read input from Node.js if needed
    # for line in sys.stdin:
    #     print(f"Received from Node: {line.strip()}")

    # Read all input data at once (e.g., file path or file content)
    input_data = sys.stdin.read().strip()
    print(f"Received from Node: {input_data}")

if __name__ == "__main__":
    main()
