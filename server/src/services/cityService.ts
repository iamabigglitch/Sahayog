import City from "../models/City";

export class CityService {
  static async listCities() {
    return City.findAll({
      attributes: ["id", "name", "province"],
      order: [["name", "ASC"]],
    });
  }

  static async getCityById(id: string) {
    return City.findByPk(id, {
      attributes: ["id", "name", "province"],
    });
  }
}
