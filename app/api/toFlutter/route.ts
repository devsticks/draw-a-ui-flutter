import { OpenAI } from "openai";

const systemPrompt = `You are a world-class Flutter developer. A user will provide you with a
 low-fidelity wireframe of an application and you will return a single dart file that uses Flutter to create the app. 
 Use creative license to flesh the application out, with awesome-looking UI and actual behaviour that follows the logic of what you're given.
if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the dart file.`;


export async function POST(request: Request) {
  const openai = new OpenAI();
  const { image } = await request.json();

  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: image, detail: "high" },
          },
          {
            type: "text",
            text: "Generate a Flutter app from this image.",
          },
        ],
      },
    ],
  });

  return new Response(JSON.stringify(resp), {
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
  });
}
