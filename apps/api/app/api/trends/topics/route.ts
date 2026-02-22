import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRawUnsafe<{ hashtag: string; count: bigint }[]>(
      `
      SELECT LOWER(tag[1]) AS hashtag,
             COUNT(*) AS count
      FROM posts,
      LATERAL regexp_matches(content, '#[A-Za-z0-9_]+', 'g') AS tag
      GROUP BY tag[1]
      ORDER BY count DESC, tag[1] ASC
      LIMIT 5;
      `
    );

    const data = result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));

    return NextResponse.json({ status: 1, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: 0, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
