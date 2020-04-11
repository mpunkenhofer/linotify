import { User, RatingType } from "./types";

const interestingRatings = ['bullet', 'blitz', 'rapid', 'classical', 'ultraBullet', 'crazyhouse', 'antichess', 'atomic', 'threeCheck', 'kingOfTheHill', 'horde', 'racingKings'];

export const topPerformance = (user: User): { mode: RatingType; rating: number; prog: number } => {
    let topPerf: { mode: RatingType; rating: number; prog: number } = { mode: 'bullet', rating: 1500, prog: 0 };

    for (const key in user.perfs) {
        const perf = user.perfs[key];

        if (perf && interestingRatings.includes(key)) {
            if (perf.rating > topPerf.rating)
                topPerf = { mode: key as RatingType, rating: perf.rating, prog: perf.prog };
        }
    }

    return topPerf;
}