from flask import Flask, jsonify, request
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
import google.generativeai as genai
import time
import os
import re

app = Flask(__name__)


def scroll_and_load_all_content(driver, model, url):
    chat_session = model.start_chat(history=[])


    try:
        driver.get(url)
        
        SCROLL_PAUSE_TIME = 0.5
        while True:
            try:
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(SCROLL_PAUSE_TIME)

                try:
                    load_more_button = driver.find_element(By.CLASS_NAME, "Ve-O24")
                    ActionChains(driver).move_to_element(load_more_button).click().perform()
                    time.sleep(SCROLL_PAUSE_TIME)   
                except Exception:
                    break

            except Exception as e:
                print(f"Error during scrolling or loading: {str(e)}")
                break

        page_content = driver.find_elements(By.TAG_NAME, "span")
        all_spans = [content.text for content in page_content]

        ques_count = 0
        ans_count = 0

    finally:
        print("Done")

    prompt = '''Analyze the provided product-related question and answer. Generate a detailed HTML response using Bootstrap 5. The response should include the following sections:

Key Features: Display in a Bootstrap 5 table format with the feature name and description.
Main Drawbacks: Present in a Bootstrap 5 table format with drawback name and description.
Target Audience: Use a Bootstrap 5 unordered list format to describe who the product is best suited for.
Overall Assessment: Use bootstrap 5 unordered list to provide a final assessment in bullet points, explaining whether the product is recommended and the reasons for your conclusion.'''

    with open("dataset.txt", 'r+') as f:
        for i, span in enumerate(all_spans):
            if span == 'Q:':
                prompt += f"Q: {all_spans[i + 1]}"
                f.write(f"Q: {all_spans[i + 1]}\n")
                ques_count += 1

            elif span == 'A:':
                prompt += f"A: {all_spans[i + 1]}\n"
                f.write(f"A: {all_spans[i + 1]}\n")
                ans_count += 1

    response = chat_session.send_message(prompt)
    print(f"Found {ques_count} questions and {ans_count} answers..")

    with open("response.txt", "r+") as f:
        f.write(response.text)

    match = re.search(r"<body>(.*?)</body>", response.text, re.DOTALL)

    if match:
        return  match.group(1) 
    else:
        return "Error: couldn't fetch"


def fetch_questions_url(product_url):

    driver = webdriver.Chrome()
    genai.configure(api_key=os.environ['GEMINI_API_KEY'])

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
    )

    try:
        driver.get(product_url)
        links = driver.find_elements(By.TAG_NAME, 'a')
        link_urls = [link.get_attribute('href') for link in links if link.get_attribute('href')]
        question_link = next(link for link in link_urls if "product-questions" in link)
        return scroll_and_load_all_content(driver, model, question_link)
    except NoSuchElementException as e:
        return jsonify({"error": f"Error finding questions URL: {str(e)}"}), 404
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        driver.quit()

@app.route('/analyze', methods=['GET'])
def analyze_product():
    product_url = request.args.get('url')   
    if not product_url:
        return jsonify({"error": "Product URL is required as a parameter"}), 400
    
    return fetch_questions_url(product_url)

if __name__ == '__main__':
    app.run(debug=True)