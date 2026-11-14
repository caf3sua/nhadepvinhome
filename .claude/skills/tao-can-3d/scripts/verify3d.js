// Mẫu script kiểm tra căn 3D bằng Playwright.
// Copy sang .playwright-mcp/verify-<id>.js, sửa ID và V (cache-buster), rồi chạy bằng
// tool browser_run_code_unsafe với filename trỏ tới file đó.
async (page) => {
  const ID = 'mau-id'; // ← id căn
  const V = 1; // ← tăng mỗi lần chạy để tránh cache
  const out = 'D:/programme/git_repository/nhadepvinhome/.playwright-mcp/';
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' && !t.includes('favicon')) errors.push(t);
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:3000/3d?v=${V}#${ID}`);
  await page.waitForTimeout(3500);

  const btn = (name) => page.getByRole('button', { name, exact: true }).first();
  const pane = (name) =>
    page.getByRole('group', { name: 'Khung 3D hiển thị' }).getByRole('button', { name, exact: true });
  const left = { x: 0, y: 0, width: 457, height: 900 };

  // Từng tầng ở khung "Cả tòa"
  const floors = await page.locator('button:has-text("Tầng ")').allTextContents();
  const floorNames = [...new Set(floors.map((t) => t.trim()).filter((t) => /^Tầng \d+$/.test(t)))];
  for (const f of floorNames) {
    await btn(f).click();
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `${out}${ID}-${f.replace(' ', '')}.png`, clip: left });
  }

  // Tầng 1 xoay sang phải + phóng gần lõi thang (kiểm tra lối đi, vách WC dưới thang)
  await btn('Tầng 1').click();
  await page.waitForTimeout(1300);
  await page.mouse.move(230, 500);
  await page.mouse.down();
  for (let i = 1; i <= 20; i++) await page.mouse.move(230 - i * 14, 500);
  await page.mouse.up();
  await page.mouse.move(250, 330);
  for (let i = 0; i < 15; i++) {
    await page.mouse.wheel(0, -120);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${out}${ID}-thang-t1.png`, clip: left });

  // Toàn nhà, khung thô, từ trên
  for (const m of ['Toàn nhà', 'Khung thô', 'Từ trên']) {
    await btn(m).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}${ID}-${m.replace(/\s/g, '-')}.png`, clip: left });
  }

  // Khung Bóc mái toàn màn hình
  await btn('Tầng 1').click();
  await pane('Bóc mái').click();
  await page.getByRole('button', { name: 'Ẩn bảng' }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}${ID}-boc-mai.png` });
  await page.getByRole('button', { name: 'Hiện bảng' }).click();
  await pane('Cả hai').click();

  // Nhãn diện tích bất thường
  const zeroLabels = await page.evaluate(() =>
    [...document.querySelectorAll('.h3d-area')]
      .map((e) => e.innerText.replace(/\n/g, ' '))
      .filter((t) => /\b0,0 m²/.test(t))
  );
  return { errors, floors: floorNames, zeroLabels };
}
