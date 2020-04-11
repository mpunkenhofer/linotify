import { User, RatingType } from "./types";

export const topPerformance = (user: User): {mode: RatingType; rating: number} => {
    let topPerf: {mode: RatingType; rating: number} = {mode: 'bullet', rating: 1500};

    for(const key in user.perfs) {
        const perf = user.perfs[key];
        
        if(perf) {
            if(perf.rating > topPerf.rating)
                topPerf = {mode: key as RatingType, rating: perf.rating};
        }
    }

    return topPerf;
}