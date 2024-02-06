import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import makeResponse from "@/lib/makeResponse";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
    const { transcript, inWords = 500, prompt } = await req.json();

    if (!transcript)
        return NextResponse.json(makeResponse(400, "Transcript is required"), {
            status: 400,
        });

    try {
        const prompt = `My name is Hitesh Choudhary and I create youtube videos. Compose a ${inWords}-word ${
            inWords <= 100 ? "short" : ""
        } summary based on the following YouTube transcript. Generate summary as first person. \n${transcript}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4-0125-preview",
            stream: true,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            // OpenAI API error handling
            const { status, message } = error;
            return NextResponse.json(makeResponse(status, message), { status });
        } else {
            // General error handling
            return NextResponse.json(
                makeResponse(500, "Internal Server Error"),
                {
                    status: 500,
                }
            );
        }
    }
}
