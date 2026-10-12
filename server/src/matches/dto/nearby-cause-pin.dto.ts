import { CausePinDto } from './cause-pin.dto';

export interface NearbyCausePinDto extends CausePinDto {
    distance_km: number;
}
