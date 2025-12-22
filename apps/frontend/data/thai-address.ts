import rawData from "./thai-address.json";

export interface ProvinceData {
  districts: Record<string, DistrictData>;
}

export interface DistrictData {
  subDistricts: string[];
  getZipcode: (subDistrict: string) => string;
}

// Process raw data into structured format
const processedData: Record<string, ProvinceData> = {};
const zipCodeMap: Record<string, string> = {}; // Key: Province|Amphoe|SubDistrict

rawData.forEach((item) => {
  const { province, amphoe, district, zipcode } = item;

  if (!processedData[province]) {
    processedData[province] = { districts: {} };
  }

  if (!processedData[province].districts[amphoe]) {
    processedData[province].districts[amphoe] = {
      subDistricts: [],
      getZipcode: (sd: string) => {
        const key = `${province}|${amphoe}|${sd}`;
        return zipCodeMap[key] || "";
      },
    };
  }

  const districtEntry = processedData[province].districts[amphoe];

  // Add sub-district if not exists
  if (!districtEntry.subDistricts.includes(district)) {
    districtEntry.subDistricts.push(district);
  }

  // Store zipcode
  const key = `${province}|${amphoe}|${district}`;
  if (zipcode) {
    zipCodeMap[key] = String(zipcode);
  }
});

// Sort sub-districts
Object.values(processedData).forEach((province) => {
  Object.values(province.districts).forEach((district) => {
    district.subDistricts.sort();
  });
});

export const thaiAddressData = processedData;
export const provinces = Object.keys(thaiAddressData).sort();
