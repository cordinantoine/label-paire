import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const { description, amount, category, date } = await req.json();

  const expense = await prisma.expense.create({
    data: {
      description,
      amount: Number(amount),
      category,
      date: new Date(date),
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
