import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { CAMPAIGN_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function WinnersPage() {
  const winner = await prisma.winner.findFirst({
    include: {
      entry: {
        include: { model: true },
      },
    },
    orderBy: { place: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary text-white py-6 md:py-10 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{CAMPAIGN_NAME} Winner</h1>
        <p className="text-primary-foreground/80 font-medium md:text-lg">Congratulations to the lucky winner!</p>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-4 md:p-8">
        {!winner ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700">No winner announced yet</h2>
            <p className="text-muted-foreground mt-2">Check back later for the lucky draw result.</p>
          </div>
        ) : (
          <Card className="overflow-hidden border-t-4 shadow-sm border-t-yellow-400 bg-gradient-to-b from-yellow-50/50 to-white">
            <CardHeader className="pb-3 text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <CardTitle className="text-lg font-bold">Lucky Draw Winner</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <p className="text-xl font-black text-gray-900 mb-1">
                {(() => {
                  const parts = winner.entry.name.trim().split(" ");
                  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
                })()}
              </p>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {winner.entry.phone.substring(0, winner.entry.phone.length - 4).replace(/./g, '*')}
                {winner.entry.phone.substring(winner.entry.phone.length - 4)}
              </p>
              <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                {winner.entry.customerLocation} - {winner.entry.model?.name || "None"}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
