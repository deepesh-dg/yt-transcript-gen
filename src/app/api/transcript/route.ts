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

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_TRANSCRIPT_URL}/?videoId=${videoId}`,
            {
                method: "GET",
            }
        );

        const res = makeResponse(response.status, await response.json());

        return NextResponse.json(
            makeResponse(
                res.statusCode,
                res.success ? res.data : "Something Went Wrong..."
            ),
            {
                status: res.statusCode,
            }
        );
    } catch (error) {
        return NextResponse.json(makeResponse(500, "Internal Server Error"), {
            status: 500,
        });
    }
}
