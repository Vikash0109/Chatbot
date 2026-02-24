export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(200).json({ message: "API working" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    return res.status(200).json({
      reply: "AI response: " + message
    });

  } catch (error) {
    return res.status(500).json({
      reply: "Server error"
    });
  }
}