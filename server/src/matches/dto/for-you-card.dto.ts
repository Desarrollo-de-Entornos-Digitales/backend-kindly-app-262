import { CauseCardDto } from './cause-card.dto';

export interface ForYouCardDto extends CauseCardDto {
    affinity_score: number;
}
