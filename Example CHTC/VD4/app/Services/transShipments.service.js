// // Hàm mô phỏng tính toán phức tạp
// function performHeavyComputation(input) {
//     const start = Date.now();
//
//     console.log(input)
//     // while (Date.now() - start < input.duration) {
//     //     // Tính toán phức tạp
//     // }
//     // return `Tính toán hoàn thành sau ${input.duration}ms`;
// }
//
// module.exports = { performHeavyComputation };


const PickupLocation = require('../models/pickupLocation');
const Ward = require('../models/ward');
const PickupLocationDistance = require('../models/pickupLocationDistance');
const WardDistance = require('../models/wardDistance');
const Setting = require('../models/setting');

class FindTransshipmentPointService {
    static L_MIN = 4;
    static L_MAX = 6;
    static ONE_KM = 1;

    constructor() {
        // Khởi tạo mô hình và dịch vụ cần thiết
    }

    async execute(receiverWardId, pickupLocationId) {
        const positionA = await PickupLocation.findByPk(pickupLocationId);
        const positionO = await Ward.findByPk(receiverWardId);

        if (!positionA || !positionO) return [];

        const wardDistances = await WardDistance.findAll();
        const pickupLocationDistances = await PickupLocationDistance.findAll();
        const wards = await Ward.findAll();
        const pickupLocations = await PickupLocation.findAll();

        const radius = positionA.pickup_radius > 0
            ? positionA.pickup_radius
            : parseInt((await Setting.findOne({ where: { setting_name: 'pickup-radius' } }) || {}).setting_value || 0);

        const distanceAO = await this.getPickupLocationToWardDistance(positionA.id, positionO.id, wardDistances, pickupLocations, wards);

        if (distanceAO <= radius) return [];

        const positionB = await this.getNearestPickupLocationByWard(receiverWardId, wardDistances, pickupLocations, wards);
        const distanceAB = await this.getDistance(positionA.id, positionB.id, pickupLocationDistances, pickupLocations, wards);

        if (distanceAB <= FindTransshipmentPointService.L_MIN || positionA.id === positionB.id) return [];

        if (distanceAB > FindTransshipmentPointService.L_MIN && distanceAB < FindTransshipmentPointService.L_MAX) {
            if (distanceAO <= distanceAB) return [];

            const distanceBO = await this.getPickupLocationToWardDistance(positionB.id, positionO.id, wardDistances, pickupLocations, wards);
            if (distanceBO <= FindTransshipmentPointService.ONE_KM && (distanceAO > FindTransshipmentPointService.L_MIN && distanceAO < FindTransshipmentPointService.L_MAX)) {
                return [];
            } else {
                return [positionB];
            }
        }

        const positionX = await this.findPositionX(
            positionB.id,
            positionA.id,
            positionO.id,
            pickupLocationDistances,
            wardDistances,
            distanceAO,
            pickupLocations,
            wards
        );

        if (positionX) return [positionX];

        let lMaxPlus = FindTransshipmentPointService.L_MAX;
        while (lMaxPlus <= distanceAO) {
            lMaxPlus++;
            const positionY = await this.findPositionX(
                positionB.id,
                positionA.id,
                positionO.id,
                pickupLocationDistances,
                wardDistances,
                distanceAO,
                pickupLocations,
                wards,
                FindTransshipmentPointService.L_MAX,
                lMaxPlus,
                false
            );

            if (positionY) {
                const distanceAY = await this.getDistance(positionA.id, positionY.id, pickupLocationDistances, pickupLocations, wards);
                if (distanceAY < distanceAO) {
                    return [positionY];
                }
            }
        }

        return [];
    }

    async getNearestPickupLocationByWard(wardId, wardDistances, pickupLocations, wards) {
        let minDistance = Infinity;
        let nearestPickupLocationId = 0;

        const wardDistancesFiltered = wardDistances.filter(item => item.ward_id === wardId);
        const pickupLocationsFiltered = pickupLocations.filter(location => wardDistancesFiltered.some(d => d.pickup_location_id === location.id));

        for (const wardDistance of wardDistancesFiltered) {
            const reverseDistance = Math.round(wardDistance.reverse_distance / 1000);

            const pickupLocation = pickupLocationsFiltered.find(loc => loc.id === wardDistance.pickup_location_id);

            if (reverseDistance < minDistance && pickupLocation) {
                minDistance = reverseDistance;
                nearestPickupLocationId = wardDistance.pickup_location_id;
            }
        }

        return pickupLocationsFiltered.find(loc => loc.id === nearestPickupLocationId);
    }

    async getDistance(fromLocationId, toLocationId, pickupLocationDistances, pickupLocations, wards) {
        const pickupLocationDistance = pickupLocationDistances.find(item => item.from_location_id === fromLocationId && item.to_location_id === toLocationId);

        let distance = pickupLocationDistance ? pickupLocationDistance.distance : 0;

        if (!distance) {
            const fromPickupLocation = pickupLocations.find(loc => loc.id === fromLocationId);
            const toPickupLocation = pickupLocations.find(loc => loc.id === toLocationId);

            const result = calculateKilometerByCoordinate(
                fromPickupLocation.longitude,
                fromPickupLocation.latitude,
                toPickupLocation.longitude,
                toPickupLocation.latitude
            );

            return Math.round(result) || 0;
        }

        return Math.round(distance / 1000);
    }

    async getPickupLocationToWardDistance(pickupLocationId, wardId, wardDistances, pickupLocations, wards) {
        const wardDistance = wardDistances.find(item => item.ward_id === wardId && item.pickup_location_id === pickupLocationId);

        let distance = wardDistance ? wardDistance.reverse_distance : 0;

        if (!distance) {
            const pickupLocation = pickupLocations.find(loc => loc.id === pickupLocationId);
            const ward = wards.find(w => w.id === wardId);

            const result = calculateKilometerByCoordinate(
                pickupLocation.longitude,
                pickupLocation.latitude,
                ward.longitude,
                ward.latitude
            );

            return Math.round(result) || 0;
        }

        return Math.round(distance / 1000);
    }

    async findPositionX(positionB_Id, fromLocationId, toLocationId, pickupLocationDistances, wardDistances, distanceAO, pickupLocations, wards, lMin = FindTransshipmentPointService.L_MIN, lMax = FindTransshipmentPointService.L_MAX, biggerLMin = true) {
        let positionXId = 0;
        let minDistance = Infinity;

        for (const tmpLocation of pickupLocations) {
            const distance1 = await this.getDistance(fromLocationId, tmpLocation.id, pickupLocationDistances, pickupLocations, wards);

            if (!distance1) continue;

            const distance2 = await this.getPickupLocationToWardDistance(tmpLocation.id, toLocationId, wardDistances, pickupLocations, wards);

            if (!distance2) continue;

            const distance = distance1 + distance2;
            const distanceAX = await this.getDistance(fromLocationId, tmpLocation.id, pickupLocationDistances, pickupLocations, wards);

            const ruleL = biggerLMin ? (distanceAX > lMin && distanceAX < lMax) : (distanceAX >= lMin && distanceAX < lMax);
            const ruleXoLtAo = (distance2 < distanceAO);

            if (distance < minDistance && tmpLocation.id !== positionB_Id && ruleL && ruleXoLtAo && distance2 > FindTransshipmentPointService.ONE_KM) {
                minDistance = distance;
                positionXId = tmpLocation.id;
            }
        }

        return pickupLocations.find(loc => loc.id === positionXId);
    }
}

module.exports = FindTransshipmentPointService;

// Helper function to calculate distance by coordinates
function calculateKilometerByCoordinate(lon1, lat1, lon2, lat2) {
    // Implementation of distance calculation here
}
