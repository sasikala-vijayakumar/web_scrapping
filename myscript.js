import { launch } from "puppeteer";

async function scrapeFIFAWorldCupYears() {
  const browser = await launch();
  const page = await browser.newPage();
  await page.goto("https://en.wikipedia.org/wiki/FIFA_World_Cup");

  // Wait for the table to load
  await page.waitForSelector(".wikitable");
  page.on("response", async (response) => {
    console.log(response);
  }); // Extract data from the table
  const yearsWithData = await page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll(
        "#mw-content-text > div.mw-content-ltr.mw-parser-output > table:nth-child(109) > tbody > tr"
      )
    );
    const yearsWithData = [];

    for (const row of rows) {
      const yearAnchor = row.querySelector("td:nth-child(1) a");
      if (yearAnchor) {
        const year = yearAnchor.getAttribute("title").match(/\d{4}/)[0];
        const dateElement = row.querySelector("td:nth-child(5)");
        const date = dateElement
          ? dateElement.textContent.trim()
          : "Date not available";
        yearsWithData.push({ year, date });
      }
    }
    return yearsWithData;
  });

  // Add event listeners to each year element
  for (const data of yearsWithData) {
    await page.click(`td a[title="${data.year} FIFA World Cup"]`);
    await page.waitForSelector(".infobox.vcalendar tbody tr:nth-child(5)");
    const date = await page.$eval(
      ".infobox.vcalendar tbody tr:nth-child(5) td",
      (row) => row.textContent.trim()
    );
    data.date = date;
    await page.goBack();
  }

  await browser.close();

  return yearsWithData;
}

scrapeFIFAWorldCupYears()
  .then((yearsWithData) => {
    console.log("FIFA World Cup years with date:", yearsWithData);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
