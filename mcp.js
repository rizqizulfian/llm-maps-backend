console.log = console.error;
console.info = console.error;
console.warn = console.error;

require('dotenv').config();
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const server = new Server({
    name: "google-maps-mcp",
    version: "1.0.0"
}, {
    capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_location_map",
                description: "Mencari daftar rekomendasi tempat di Google Maps.",
                inputSchema: {
                    type: "object",
                    properties: {
                        location: { type: "string", description: "Nama kota atau daerah." },
                        place_type: { type: "string", description: "Jenis tempat yang dicari." }
                    },
                    required: ["location", "place_type"]
                }
            },
            {
                name: "get_route_info",
                description: "Mencari JARAK, WAKTU TEMPUH, atau RUTE dari satu tempat ke tempat lain.",
                inputSchema: {
                    type: "object",
                    properties: {
                        origin: { type: "string", description: "Titik awal keberangkatan." },
                        destination: { type: "string", description: "Titik tujuan akhir." }
                    },
                    required: ["origin", "destination"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (request.params.name === "get_location_map") {
            const { location, place_type } = request.params.arguments;

            const searchQuery = `${place_type} in ${location}`;
            const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (searchData.status !== 'OK' || searchData.results.length === 0) {
                return { content: [{ type: "text", text: `Maaf, tidak menemukan ${place_type} di ${location}.` }] };
            }

            const top5 = searchData.results.slice(0, 5);
            const detailedPlaces = await Promise.all(top5.map(async (place) => {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,price_level,opening_hours,reviews,url&key=${apiKey}`;
                const detailsRes = await fetch(detailsUrl);
                const detailsData = await detailsRes.json();
                return detailsData.result || place;
            }));

            let markdownResult = `Berikut adalah 5 rekomendasi **${place_type}** teratas di **${location}**:\n\n`;
            let whatsappResult = `Berikut adalah 5 rekomendasi *${place_type}* teratas di *${location}*:\n\n`;

            detailedPlaces.forEach((item, index) => {
                const name = item.name;
                const address = item.formatted_address;
                const rating = item.rating ? `${item.rating} ⭐ (${item.user_ratings_total})` : 'Belum ada rating';
                const priceMap = ['Gratis', 'Murah ($)', 'Menengah ($$)', 'Mahal ($$$)', 'Sangat Mahal ($$$$)'];
                const price = item.price_level !== undefined ? priceMap[item.price_level] : 'Harga tidak diketahui';
                const isOpen = item.opening_hours?.open_now ? '🟢 Buka Sekarang' : '🔴 Tutup/Info tidak ada';

                let topReview = 'Belum ada ulasan tertulis.';
                if (item.reviews && item.reviews.length > 0) {
                    let text = item.reviews[0].text.replace(/(\r\n|\n|\r)/gm, " ");
                    topReview = text.length > 100 ? text.substring(0, 100) + '...' : text;
                }

                const mapLink = item.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`;
                const dirLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name)}&destination_place_id=${item.place_id}`;

                markdownResult += `${index + 1}. **${name}**\n`;
                markdownResult += `   📊 Rating: ${rating} | 💰 ${price} | ${isOpen}\n`;
                markdownResult += `   💬 *" ${topReview} "*\n`;
                markdownResult += `   📍 [Buka Peta](${mapLink}) | 🚗 [Get Directions](${dirLink})\n\n`;

                whatsappResult += `${index + 1}. *${name}*\n`;
                whatsappResult += `   - Rating: ${rating} | Harga: ${price} | Status: ${isOpen}\n`;
                whatsappResult += `   - Review: "_${topReview}_"\n`;
                whatsappResult += `   - Alamat: ${address}\n`;
                whatsappResult += `   - Detail Tempat: ${mapLink}\n`;
                whatsappResult += `   - Rute & Arah: ${dirLink}\n\n`;
            });

            const waText = encodeURIComponent(whatsappResult).replace(/\*/g, '%2A');
            markdownResult += `\n\n---\n📲 **[Bagikan Rekomendasi ini ke WhatsApp](https://wa.me/?text=${waText})**`;

            return {
                content: [{ type: "text", text: markdownResult }]
            };
        }

        else if (request.params.name === "get_route_info") {
            const { origin, destination } = request.params.arguments;

            const routeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;

            const response = await fetch(routeUrl);
            const data = await response.json();

            if (data.status !== 'OK' || data.routes.length === 0) {
                return { content: [{ type: "text", text: `Maaf, saya tidak menemukan jalur dari ${origin} ke ${destination}.` }] };
            }

            const leg = data.routes[0].legs[0];
            const distance = leg.distance.text;
            const duration = leg.duration.text;
            const startAddress = leg.start_address;
            const endAddress = leg.end_address;

            const navLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

            let markdownResult = `🚗 **Informasi Rute Perjalanan**\n\n`;
            markdownResult += `* **Dari:** ${startAddress}\n`;
            markdownResult += `* **Ke:** ${endAddress}\n`;
            markdownResult += `* **Jarak:** ${distance}\n`;
            markdownResult += `* **Waktu Tempuh:** ${duration} (menggunakan mobil)\n\n`;
            markdownResult += `🔗 [Buka Navigasi di Google Maps](${navLink})\n`;

            let whatsappResult = `🚗 *Informasi Rute Perjalanan*\n\n`;
            whatsappResult += `* *Dari:* ${startAddress}\n`;
            whatsappResult += `* *Ke:* ${endAddress}\n`;
            whatsappResult += `* *Jarak:* ${distance}\n`;
            whatsappResult += `* *Waktu Tempuh:* ${duration} (menggunakan mobil)\n\n`;
            whatsappResult += `🔗 Link Navigasi: ${navLink}\n`;

            const waText = encodeURIComponent(whatsappResult).replace(/\*/g, '%2A');
            markdownResult += `\n---\n📲 **[Bagikan Rute ini ke WhatsApp](https://wa.me/?text=${waText})**`;

            return {
                content: [{ type: "text", text: markdownResult }]
            };
        }

        throw new Error("Tool tidak ditemukan");

    } catch (error) {
        console.error("Error executing tool:", error.message);
        return { content: [{ type: "text", text: "Terjadi kesalahan pada server saat memproses data tempat/rute." }] };
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 MCP Server Google Maps Berjalan!");
}

run();