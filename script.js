const map = L.map("map").setView([36.2048, 138.2529], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// 🔁 ミラーサーバー使用（安定）
const overpassUrl = "https://overpass.kumi.systems/api/interpreter";

const query = `
[out:json][timeout:25];
area["ISO3166-1"="JP"][admin_level=2];
(
  node["tourism"="museum"](area);
  way["tourism"="museum"](area);
  relation["tourism"="museum"](area);
);
out center tags;
`;

fetch(overpassUrl, {
  method: "POST",
  body: query
})
.then(res => res.json())
.then(data => {

  data.elements.forEach(el => {

    let lat, lon;

    if (el.type === "node") {
      lat = el.lat;
      lon = el.lon;
    } else if (el.center) {
      lat = el.center.lat;
      lon = el.center.lon;
    }

    if (!lat || !lon) return;

    const name = el.tags?.name || "名称不明の美術館";
    const website = el.tags?.website || el.tags?.url;

    const marker = L.circleMarker([lat, lon], {
      radius: 6,
      color: "red",
      fillColor: "red",
      fillOpacity: 0.8
    }).addTo(map);

    let popup = `<b>${name}</b><br/>`;

    if (website) {
      popup += `<a href="${website}" target="_blank">公式HPを見る</a>`;
    } else {
      popup += `公式HP情報なし`;
    }

    marker.bindPopup(popup);

  });

})
.catch(err => {
  console.error("取得エラー:", err);
});
