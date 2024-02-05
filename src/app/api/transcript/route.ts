import getYoutubeVideoId from "@/lib/getYoutubeVideoId";
import makeResponse from "@/lib/makeResponse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { url } = await request.json();

    const videoId = getYoutubeVideoId(url);

    if (!videoId)
        return NextResponse.json(makeResponse(400, "Invalid URL"), {
            status: 400,
        });

    const baseUrl = "https://www.googleapis.com/youtube/v3/captions";
    const apiUrl = `${baseUrl}?part=snippet&videoId=${videoId}&key=${process.env.GOOGLE_API_KEY}`;

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.error) {
            return NextResponse.json(
                makeResponse(data.error.code, data.error.message),
                {
                    status: data.error.code,
                }
            );
        }

        if (data.items && data.items.length > 0) {
            const firstCaption = data.items[0];

            const captionId = firstCaption.id;

            const res = await fetch(
                `${baseUrl}/${captionId}?key=${process.env.GOOGLE_API_KEY}`
            );
            const captionData = await res.json();

            if (captionData.error) {
                return NextResponse.json(
                    makeResponse(
                        captionData.error.code,
                        captionData.error.message
                    ),
                    {
                        status: captionData.error.code,
                    }
                );
            }

            console.log({ captionData });

            return NextResponse.json({ captionData });
        }

        return NextResponse.json(
            makeResponse(404, "No caption tracks available for the video."),
            {
                status: 404,
            }
        );
    } catch (error) {
        return NextResponse.json(makeResponse(500, "Internal Server Error"), {
            status: 500,
        });
    }
}
