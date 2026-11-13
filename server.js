
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/apply", async (req, res) => {
    try {
        const data = req.body;

        const required = [
            "username",
            "discordId",
            "age",
            "timezone",
            "position",
            "activity",
            "reason",
            "experience",
            "ruleHandling",
            "conflict",
            "abuse",
            "programming",
            "choose",
            "contribution",
            "agreement"
        ];

        for (const field of required) {
            if (
                !data[field] ||
                typeof data[field] !== "string" ||
                !data[field].trim()
            ) {
                return res.status(400).json({
                    error: "Missing required fields"
                });
            }
        }

        if (!/^\d{17,20}$/.test(data.discordId)) {
            return res.status(400).json({
                error: "Invalid Discord User ID"
            });
        }

        const age = Number(data.age);

        if (!Number.isInteger(age) || age < 13 || age > 100) {
            return res.status(400).json({
                error: "Invalid age"
            });
        }

        if (data.agreement !== "Yes") {
            return res.status(400).json({
                error: "Staff rules agreement is required"
            });
        }

        const fields = [
            ["Discord Username", data.username],
            ["Discord User ID", data.discordId],
            ["Age", data.age],
            ["Timezone", data.timezone],
            ["Position", data.position],
            ["Daily Activity", data.activity],
            ["Why Ken Hub?", data.reason],
            ["Previous Experience", data.experience],
            ["Experience Details", data.experienceDetails || "Not provided"],
            ["Rule Handling", data.ruleHandling],
            ["Conflict Handling", data.conflict],
            ["Staff Abuse Response", data.abuse],
            ["Programming Knowledge", data.programming],
            ["Languages", Array.isArray(data.languages) ? data.languages.join(", ") : "None"],
            ["Skill Level", data.skill || "Not provided"],
            ["Programming Duration", data.programmingTime || "Not provided"],
            ["Projects", data.projects || "Not provided"],
            ["Why Choose You?", data.choose],
            ["Contribution", data.contribution],
            ["Staff Rules Agreement", data.agreement]
        ];

        const embed = {
            title: "KEN HUB | NEW STAFF APPLICATION",
            color: 0xFFFFFF,
            fields: fields.map(([name, value]) => ({
                name: name.slice(0, 256),
                value: String(value).slice(0, 1024),
                inline: false
            })),
            footer: {
                text: "Ken Hub Staff Recruitment System"
            },
            timestamp: new Date().toISOString()
        };

        const webhookResponse = await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                embeds: [embed],
                allowed_mentions: {
                    parse: []
                }
            })
        });

        if (!webhookResponse.ok) {
            throw new Error("Discord webhook failed");
        }

        res.json({ success: true });

    } catch (error) {
        console.error("Application error:", error.message);

        res.status(500).json({
            error: "Unable to submit application"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Ken Hub website running on port ${PORT}`);
});
