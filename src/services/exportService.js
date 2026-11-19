import { NativeModules } from "react-native";
import { API_CONFIG } from "../constants";
import { api } from "./transactionService";
import i18n from "../i18n";

/**
 * @description One-time data export for the offline Monedsa v2 app.
 */
export const exportService = {
  /**
   * @description Fetches the user's categories and transactions in the v2 import format.
   * @returns { Promise<Object> } The export object ({ schemaVersion, exportedAt, app, categories, transactions }).
   */
  async getExport() {
    try {
      const response = await api.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.EXPORT}`);
      if (response.data?.app !== "monedsa" || !Array.isArray(response.data?.transactions)) {
        throw new Error(i18n.t("settingsScreen.export.fail"));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.customMessage || error.response?.data?.message || error.message || i18n.t("settingsScreen.export.fail"));
    }
  },

  /**
   * @description Fetches the export and opens the share sheet with monedsa-export-YYYY-MM-DD.json.
   * @returns { Promise<string> } The file name that was shared.
   */
  async exportAndShare() {
    const data = await this.getExport();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const fileName = `monedsa-export-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;

    await NativeModules.ExportShare.shareFile(
      fileName,
      JSON.stringify(data, null, 2),
      "application/json",
      i18n.t("settingsScreen.export.shareTitle")
    );
    return fileName;
  },
};
