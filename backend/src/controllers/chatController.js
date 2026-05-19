const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Khởi tạo Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Customer Question: "${message}"`,
            config: {
                systemInstruction: `- Bạn là nhân viên hỗ trợ khách hàng của Nhà sách Sahafa.
                - Giọng điệu: Thân thiện, phong cách Gen Z, sử dụng biểu tượng cảm xúc, xưng hô với người dùng là 'bạn' và tự xưng là 'mình'.
                - Nhiệm vụ: Giới thiệu sách, trả lời câu hỏi về vận chuyển (Miễn phí vận chuyển cho đơn hàng > 200k, nếu không thì phí cố định là 40k).
                - Không bịa đặt thông tin về sách.
                [Cơ sở kiến thức được bao gồm trong lời nhắc...]`,
            },
        });

        return res.json({ reply: response.text });
    } catch (error) {
        console.error("Lỗi AI:", error);
        return res
            .status(500)
            .json({ reply: "Xin lỗi, mình đang gặp chút trục trặc khi suy nghĩ. Vui lòng thử lại sau nhé!" });
    }
};

module.exports = { chat };
