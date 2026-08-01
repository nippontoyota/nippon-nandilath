import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Medal } from "lucide-react";
import { CAMPAIGN_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function WinnersPage() {
  const winners = await prisma.winner.findMany({
    include: {
      entry: {
        include: { model: true, colour: true },
      },
      branch: true,
    },
    orderBy: [
      { branch: { name: "asc" } },
      { place: "asc" },
    ],
  });

  // Group winners by branch
  const winnersByBranch = winners.reduce((acc, winner) => {
    if (!acc[winner.branch.name]) {
      acc[winner.branch.name] = [];
    }
    acc[winner.branch.name].push(winner);
    return acc;
  }, {} as Record<string, typeof winners>);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-primary text-white py-6 md:py-10 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{CAMPAIGN_NAME} Winners</h1>
        <p className="text-primary-foreground/80 font-medium md:text-lg">Congratulations to all the lucky winners!</p>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {Object.keys(winnersByBranch).length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700">No winners announced yet</h2>
            <p className="text-muted-foreground mt-2">Check back later for the lucky draw results.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(winnersByBranch).map(([branchName, branchWinners]) => (
              <div key={branchName} className="space-y-4">
                <h2 className="text-2xl font-black text-primary border-b-2 border-primary/20 pb-2 inline-block pr-8">
                  {branchName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {branchWinners.map((winner) => (
                    <Card key={winner.id} className={`overflow-hidden border-t-4 shadow-sm hover:shadow-md transition-shadow ${
                      winner.place === 1 ? "border-t-yellow-400 bg-gradient-to-b from-yellow-50/50 to-white" :
                      winner.place === 2 ? "border-t-gray-400 bg-gradient-to-b from-gray-50/50 to-white" :
                      "border-t-orange-400 bg-gradient-to-b from-orange-50/50 to-white"
                    }`}>
                      <CardHeader className="pb-3 text-center">
                        <div className="flex justify-center mb-2">
                          {winner.place === 1 ? <Trophy className="w-8 h-8 text-yellow-500" /> :
                           winner.place === 2 ? <Medal className="w-8 h-8 text-gray-500" /> :
                           <Star className="w-8 h-8 text-orange-500" />}
                        </div>
                        <CardTitle className="text-lg font-bold">
                          {winner.place}{winner.place === 1 ? "st" : winner.place === 2 ? "nd" : "rd"} Prize
                        </CardTitle>
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
                          {winner.entry.model.name} - {winner.entry.colour.name}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
