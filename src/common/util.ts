import { User, RatingType } from "./types";

const interestingRatings = ['bullet', 'blitz', 'rapid', 'classical', 'ultraBullet', 'crazyhouse', 'antichess', 'atomic', 'threeCheck', 'kingOfTheHill', 'horde', 'racingKings'];

export const createUser = (id: string): User => (
    {
        id,
        username: id,
        title: '',
        online: false,
        playing: false,
        patron: false,
        perfs: {},
        seenAt: 0,
        lastApiUpdate: 0,
        notifyWhenOnline: false,
        notifyWhenPlaying: true
    }
);

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

export const sortByRating = (users: User[]): User[] => {
    return users.sort((a, b) => {
        const d = topPerformance(b).rating - topPerformance(a).rating;

        if(d != 0)
            return d;
        else
            return a.id.localeCompare(b.id);
    });
}

export const sortByName = (users: User[]): User[] => {
    return users.sort((a, b) => {
        return a.id.localeCompare(b.id);
    });
}