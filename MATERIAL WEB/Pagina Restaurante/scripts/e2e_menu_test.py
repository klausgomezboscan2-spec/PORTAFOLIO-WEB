from playwright.sync_api import sync_playwright

URL = 'http://localhost:8000/HTML/index.html'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(URL, timeout=10000)

    # Wait for menu grid and header
    page.wait_for_selector('#menu-grid', timeout=5000)

    print('✅ Page loaded, #menu-grid present')

    # Verify desktop menu buttons (may be hidden on small viewport)
    try:
        if page.is_visible('.desktop-menu'):
            print('✅ Desktop menu visible')
        else:
            print('ℹ Desktop menu not visible (small viewport)')
    except Exception as e:
        print('⚠ Could not determine desktop menu visibility:', e)

    # Test mobile hamburger: set small viewport and click toggle
    page.set_viewport_size({'width': 375, 'height': 800})
    page.wait_for_timeout(500)
    try:
        page.click('#mobile-menu-toggle')
        page.wait_for_selector('#mobile-nav.open', timeout=3000)
        print('✅ Mobile menu opened')
    except Exception as e:
        print('❌ Mobile menu did not open:', e)

    # Click first "Añadir" button in menu (if present) and check cart count
    try:
        # ensure menu items rendered by JS
        page.wait_for_selector('.btn-gold', timeout=5000)
        first_add = page.query_selector('.btn-gold')
        if first_add:
            first_add.click()
            page.wait_for_timeout(500)
            cart_count = page.inner_text('#cart-count')
            print('✅ Added item to cart; cart-count =', cart_count)
        else:
            print('❌ No add-to-cart button found')
    except Exception as e:
        print('❌ Error adding to cart:', e)

    browser.close()
