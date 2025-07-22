// src/components/scenarios/components/ExportModal.tsx

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  FileSpreadsheet,
  Download,
  FileJson,
  Crown,
  Check,
  X,
} from "lucide-react";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { useAuth } from "@/hooks/useAuth";
import { useScenarioExport } from "../hooks/useScenarioExport";
import type { TimelineScenario } from "@/types/scenario";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: TimelineScenario[];
  selectedScenarioIds: string[];
}

type ExportFormat = "csv" | "pdf" | "excel" | "json";

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  selectedScenarioIds,
}) => {
  const t = useTranslations("ExportScenarios");
  const { user } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [includeCharts, setIncludeCharts] = useState(false);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { handleExportScenarios } = useScenarioExport();

  const exportFormats = [
    {
      id: "csv" as ExportFormat,
      name: t("formats.csv"),
      description: t("formats.csvDescription"),
      icon: FileSpreadsheet,
      isPremium: false,
      features: [
        t("features.basicExport"),
        t("features.spreadsheetCompatible"),
        t("features.utf8Encoded"),
      ],
    },
    {
      id: "pdf" as ExportFormat,
      name: t("formats.pdf"),
      description: t("formats.pdfDescription"),
      icon: FileText,
      isPremium: true,
      features: [
        t("features.professionalFormatting"),
        t("features.chartsAndTables"),
        t("features.printReady"),
      ],
    },
    {
      id: "excel" as ExportFormat,
      name: t("formats.excel"),
      description: t("formats.excelDescription"),
      icon: FileSpreadsheet,
      isPremium: true,
      features: [
        t("features.multipleWorksheets"),
        t("features.summaryStatistics"),
        t("features.advancedFormatting"),
      ],
    },
    {
      id: "json" as ExportFormat,
      name: t("formats.json"),
      description: t("formats.jsonDescription"),
      icon: FileJson,
      isPremium: true,
      features: [
        t("features.completeDataStructure"),
        t("features.apiIntegration"),
        t("features.machineReadable"),
      ],
    },
  ];

  const handleExport = async () => {
    if (selectedScenarioIds.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      await handleExportScenarios(
        scenarios,
        selectedScenarioIds,
        selectedFormat
      );
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedFormatInfo = exportFormats.find((f) => f.id === selectedFormat);
  const userTier = user?.user_metadata?.subscription_tier || "free";
  const canAccessPremiumFeatures = userTier !== "free";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {selectedScenarioIds.length > 0
              ? `${t("description")} (${selectedScenarioIds.length} scenarios selected)`
              : t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("selectFormat")}</CardTitle>
              <p className="text-sm text-gray-600">{t("subtitle")}</p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedFormat}
                onValueChange={(value) =>
                  setSelectedFormat(value as ExportFormat)
                }
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {exportFormats.map((format) => (
                    <div key={format.id} className="relative">
                      <div
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                          selectedFormat === format.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${
                          format.isPremium && !canAccessPremiumFeatures
                            ? "opacity-60"
                            : ""
                        }`}
                      >
                        <RadioGroupItem
                          value={format.id}
                          id={format.id}
                          disabled={
                            format.isPremium && !canAccessPremiumFeatures
                          }
                        />
                        <format.icon className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={format.id}
                              className="font-medium cursor-pointer"
                            >
                              {format.name}
                            </Label>
                            {format.isPremium && (
                              <Badge
                                variant="outline"
                                className="text-yellow-600 border-yellow-300"
                              >
                                <Crown className="w-3 h-3 mr-1" />
                                {t("premium")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {format.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {format.features.map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                <Check className="w-3 h-3" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {format.isPremium && !canAccessPremiumFeatures && (
                        <FeatureGate
                          featureKey="advanced_export"
                          promptStyle="inline"
                        >
                          <div className="absolute inset-0 bg-transparent cursor-pointer" />
                        </FeatureGate>
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Two-column layout for options and preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Options */}
            {selectedFormatInfo &&
              (selectedFormat === "pdf" || selectedFormat === "excel") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("exportOptions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="include-charts"
                          checked={includeCharts}
                          onCheckedChange={(checked) =>
                            setIncludeCharts(!!checked)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="include-charts"
                            className="font-medium"
                          >
                            {t("includeCharts")}
                          </Label>
                          <p className="text-sm text-gray-500">
                            Add visual charts and graphs to your export
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="include-analysis"
                          checked={includeAnalysis}
                          onCheckedChange={(checked) =>
                            setIncludeAnalysis(!!checked)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="include-analysis"
                            className="font-medium"
                          >
                            {t("includeAnalysis")}
                          </Label>
                          <p className="text-sm text-gray-500">
                            Include detailed financial analysis
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("exportPreview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {t("selectedScenarios")}:
                    </span>
                    <span>{selectedScenarioIds.length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t("exportFormat")}:</span>
                    <span>{selectedFormatInfo?.name}</span>
                  </div>
                  {selectedFormat === "excel" && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{t("worksheets")}:</span>
                      <span>{t("worksheetContent")}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-3">
                    {t("downloadNotice")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleExport}
              disabled={
                selectedScenarioIds.length === 0 ||
                isExporting ||
                (selectedFormatInfo?.isPremium && !canAccessPremiumFeatures)
              }
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full w-4 h-4 border-2 border-white border-t-transparent mr-2" />
                  {t("exporting")}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t("export")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
