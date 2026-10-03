"""Comprehensive browser test for Raven IQ Test app."""
from playwright.sync_api import sync_playwright
import sys

def test_app():
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        # 1. Test home page loads
        print("1. Testing home page...")
        page.goto("http://localhost:4173/")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="i:/智商测试软件/raven-iq-test/screenshots/01_home.png", full_page=True)

        title = page.locator("h1").text_content()
        if "瑞文标准推理测验" not in title:
            errors.append(f"Home page title incorrect: {title}")
        print(f"   Title: {title}")

        # 2. Test age validation - empty
        print("2. Testing age validation (empty)...")
        page.locator("button[type='submit']").click()
        page.wait_for_timeout(500)
        error_msg = page.locator(".color-incorrect").text_content()
        if "整数" not in error_msg:
            errors.append(f"Empty age validation error: {error_msg}")
        print(f"   Error: {error_msg}")

        # 3. Test age validation - out of range
        print("3. Testing age validation (out of range)...")
        page.locator("#age-input").fill("100")
        page.locator("button[type='submit']").click()
        page.wait_for_timeout(500)
        error_msg = page.locator(".color-incorrect").text_content()
        if "5-65" not in error_msg:
            errors.append(f"Range validation error: {error_msg}")
        print(f"   Error: {error_msg}")

        # 4. Start test with valid age
        print("4. Starting test with age 25...")
        page.locator("#age-input").fill("25")
        page.locator("button[type='submit']").click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path="i:/智商测试软件/raven-iq-test/screenshots/02_test_started.png", full_page=True)

        # Verify we're on the test page
        current_url = page.url
        if "/test" not in current_url:
            errors.append(f"Not on test page: {current_url}")
        print(f"   URL: {current_url}")

        # 5. Check progress bar shows
        print("5. Checking progress bar...")
        progress = page.locator(".progress-bar__fill")
        if progress.count() == 0:
            errors.append("Progress bar not found")
        else:
            width = progress.get_attribute("style")
            print(f"   Progress: {width}")

        # 6. Check question matrix is rendered
        print("6. Checking question matrix...")
        matrix_cells = page.locator(".question-card__matrix-cell")
        cell_count = matrix_cells.count()
        print(f"   Matrix cells: {cell_count}")
        if cell_count != 9:
            errors.append(f"Expected 9 matrix cells, got {cell_count}")

        # Check missing cell
        missing = page.locator(".question-card__matrix-cell--missing")
        missing_count = missing.count()
        print(f"   Missing cells: {missing_count}")
        if missing_count != 1:
            errors.append(f"Expected 1 missing cell, got {missing_count}")

        # 7. Check options are rendered
        print("7. Checking options...")
        options = page.locator(".option-item")
        option_count = options.count()
        print(f"   Options: {option_count}")
        if option_count < 6:
            errors.append(f"Expected at least 6 options, got {option_count}")

        # 8. Click an option and verify selection
        print("8. Testing option selection...")
        options.nth(0).click()
        page.wait_for_timeout(500)
        selected = page.locator(".option-item--selected")
        if selected.count() != 1:
            errors.append(f"Expected 1 selected option, got {selected.count()}")
        page.screenshot(path="i:/智商测试软件/raven-iq-test/screenshots/03_option_selected.png", full_page=True)

        # 9. Navigate to next question
        print("9. Testing navigation...")
        next_btn = page.locator("text=下一题")
        if next_btn.count() > 0 and next_btn.is_enabled():
            next_btn.click()
            page.wait_for_timeout(500)
            page.screenshot(path="i:/智商测试软件/raven-iq-test/screenshots/04_next_question.png", full_page=True)
            progress_text = page.locator(".text-sm.color-secondary").first.text_content()
            print(f"   Progress text: {progress_text}")

        # 10. Navigate back
        print("10. Testing back navigation...")
        prev_btn = page.locator("text=上一题")
        if prev_btn.count() > 0 and prev_btn.is_enabled():
            prev_btn.click()
            page.wait_for_timeout(500)

        # 11. Quick-answer all questions and submit
        print("11. Answering all questions quickly...")
        for i in range(72):
            # Click first option for each question
            opts = page.locator(".option-item")
            if opts.count() > 0:
                opts.nth(0).click()
                page.wait_for_timeout(400)

            # Try to go next or submit
            if i < 71:
                next_btn = page.locator("text=下一题")
                if next_btn.count() > 0 and next_btn.is_enabled():
                    next_btn.click()
                    page.wait_for_timeout(200)
            else:
                submit_btn = page.locator("text=提交测验")
                if submit_btn.count() > 0:
                    submit_btn.click()
                    page.wait_for_timeout(1000)

        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path="i:/智商测试软件/raven-iq-test/screenshots/05_result.png", full_page=True)

        # 12. Check result page
        print("12. Checking result page...")
        current_url = page.url
        if "/result" not in current_url:
            errors.append(f"Not on result page: {current_url}")
        print(f"   URL: {current_url}")

        iq_score = page.locator(".result-card__score")
        if iq_score.count() > 0:
            score_text = iq_score.text_content()
            print(f"   IQ Score: {score_text}")
        else:
            errors.append("IQ score not displayed")

        iq_level = page.locator(".result-card__level")
        if iq_level.count() > 0:
            level_text = iq_level.text_content()
            print(f"   IQ Level: {level_text}")

        # 13. Check series breakdown
        print("13. Checking series breakdown...")
        series_items = page.locator("text=/\\d+\\/12/")
        series_count = series_items.count()
        print(f"   Series items: {series_count}")
        if series_count < 6:
            errors.append(f"Expected 6 series items, got {series_count}")

        # 14. Test PDF export button exists
        print("14. Checking export button...")
        export_btn = page.locator("text=导出 PDF")
        if export_btn.count() > 0:
            print("   Export button found")
        else:
            errors.append("Export button not found")

        # 15. Test history page
        print("15. Testing history page...")
        page.goto("http://localhost:4173/history")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)
        page.screenshot(path="i:/智商测试软件/raven-iq-test/screenshots/06_history.png", full_page=True)

        history_items = page.locator(".history-item")
        history_count = history_items.count()
        print(f"   History items: {history_count}")

        # 16. Test 404 page
        print("16. Testing 404 page...")
        page.goto("http://localhost:4173/nonexistent")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        page.screenshot(path="i:/智商测试软件/raven-iq-test/screenshots/07_404.png", full_page=True)
        not_found_text = page.locator("text=页面不存在")
        if not_found_text.count() > 0:
            print("   404 page displayed correctly")
        else:
            errors.append("404 page not displayed")

        # 17. Check console errors
        print("17. Checking console errors...")
        if console_errors:
            for err in console_errors:
                errors.append(f"Console error: {err}")
        else:
            print("   No console errors")

        browser.close()

    # Summary
    print("\n" + "=" * 60)
    if errors:
        print(f"FAILED: {len(errors)} error(s) found:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("ALL TESTS PASSED")
        sys.exit(0)

if __name__ == "__main__":
    test_app()
