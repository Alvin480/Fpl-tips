import { NextRequest, NextResponse } from "next/server";

const FPL_API = "https://fantasy.premierleague.com/api";

export const revalidate = 300;

async function getFplJson(path: string) {
  const response = await fetch(`${FPL_API}/${path}`, {
    headers: { "User-Agent": "ScoutIQ/1.0" },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`FPL API returned ${response.status} for ${path}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")?.trim();

    if (teamId && !/^\\d{1,10}$/.test(teamId)) {
      return NextResponse.json({ error: "Team ID must contain digits only." }, { status: 400 });
    }

    const bootstrap = await getFplJson("bootstrap-static/");
    const currentEvent = bootstrap.events?.find((event: { is_current: boolean }) => event.is_current)
      ?? bootstrap.events?.find((event: { is_next: boolean }) => event.is_next)
      ?? null;

    let manager = null;
    let picks = null;
    let teamError = null;

    if (teamId) {
      try {
        manager = await getFplJson(`entry/${teamId}/`);
        if (currentEvent?.is_current) {
          try {
            picks = await getFplJson(`entry/${teamId}/event/${currentEvent.id}/picks/`);
          } catch {
            // Picks may not be published until the Gameweek deadline.
          }
        }
      } catch {
        teamError = "Could not load this FPL team. Check the Team ID and try again.";
      }
    }

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      gameweek: currentEvent,
      totals: {
        players: bootstrap.elements?.length ?? 0,
        teams: bootstrap.teams?.length ?? 0,
      },
      players: (bootstrap.elements ?? []).map((player: Record<string, unknown>) => ({
        id: player.id,
        name: player.web_name,
        team: player.team,
        position: player.element_type,
        price: player.now_cost,
        points: player.total_points,
        form: player.form,
        status: player.status,
        selectedBy: player.selected_by_percent,
      })),
      clubs: bootstrap.teams ?? [],
      positions: bootstrap.element_types ?? [],
      manager,
      picks,
      teamError,
    });
  } catch (error) {
    console.error("FPL connection error:", error);
    return NextResponse.json(
      { error: "Could not connect to Fantasy Premier League right now. Please try again shortly." },
      { status: 502 },
    );
  }
}
