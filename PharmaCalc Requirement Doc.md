# PharmaCalc — 英國藥劑師日常計算工具 Web App
## 產品需求文件（Product Requirements Document, PRD）

**版本：** v0.2（加入來源連結）
**日期：** 2026 年 6 月
**對象使用者：** 英國社區藥房（如 Boots、Superdrug、獨立藥房）的執業藥劑師、配藥師（dispenser）、藥房技術員（pharmacy technician）
**文件性質：** 給開發者/設計師的需求規格，以及使用者訪談/驗證用參考。本文件描述「要做甚麼」與「合規依據」，不是最終臨床指引。

> ⚠️ **重要前提（請先讀）**
> 本工具定位為 **臨床決策輔助（decision-support）**，不取代藥劑師的專業判斷，也不取代 **BNF / BNFc / SmPC / NICE / FSRH** 等權威來源。所有計算結果頁面都必須顯示免責聲明（見第 7 節）。部分計算機（特別是涉及藥物劑量者）有可能被視為 **醫療器材軟件（Software as a Medical Device, SaMD）**，受 MHRA 與 UK Medical Devices Regulations 2002 規管 —— 上線前必須做法規評估（見第 7.3 節）。

---

## 1. 產品目標

| 項目 | 內容 |
|---|---|
| **問題** | 藥劑師日常要重複做大量小計算與日期判斷（處方有效期、劑量、BMI、生育週期等），多數靠心算、紙筆或散落的網站，容易出錯，亦拖慢配藥流程。 |
| **目標** | 一個**單頁、分頁式（tabbed）、手機友善**的 Web App，把最常用的計算集中一處，一撳即出結果，並標明每項計算的**法律/NHS 依據**。 |
| **成功指標** | (1) 配藥檯前單次查詢 < 15 秒完成；(2) 結果可離線使用（PWA）；(3) 零病人個資儲存；(4) 計算邏輯 100% 可追溯到官方來源。 |

---

## 2. 研究摘要：英國藥劑師日常運作與本工具的對應

以下是社區藥房常見、且可由計算機加速的工作，已對應到本 App 的分頁：

1. **核對處方有效期（dispensing date vs deadline）** —— 每張處方都要判斷是否仍在法定有效期內，CD（管制藥物）規則特別嚴格。→ Tab 2
2. **健康檢查（Healthy Living Pharmacy / NHS 服務）** —— 量 BMI、血壓、戒煙服務常要快速分類。→ Tab 1、Tab 5
3. **臨床用藥檢查** —— 腎功能計算（renal dosing，例如 DOAC、gentamicin）、體表面積、兒科按體重劑量。→ Tab 4
4. **緊急供藥（emergency supply）** —— 判斷可否供應、可供多少天。→ Tab 2 內子頁
5. **性與生殖健康（sexual & reproductive health）** —— 排卵/生育窗、預產期、避孕相關諮詢。→ Tab 3
6. **病人/服務對象自助工具** —— 簡單、好懂的計算給病人參考（酒精單位、吸煙 pack-years、預產期等）。→ Tab 5

---

### 2.1 關鍵法律依據（用於 Tab 2，已查證並附來源）

> 🔗 **如何使用此表：** 每條規則均附官方來源連結，供使用者訪談中驗證及開發時引用。計算邏輯必須與這些來源保持一致；如法規更新，必須更新本表同時修改計算邏輯。

| 規則 | 內容 | 官方來源（可點擊驗證） |
|---|---|---|
| 一般處方有效期 | 自「appropriate date」起 **6 個月**內須首次配發，到期時間 23:59:59 | [NHS — How long is a prescription valid for?](https://www.nhs.uk/common-health-questions/medicines/how-long-is-a-prescription-valid-for/) |
| FP10 有效期（NHSBSA 官方 FAQ） | FP10 處方自適當日期起 6 個月有效；Schedule 2/3/4 CD 僅 28 天 | [NHSBSA FAQ — KA-01561](https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-01561/en-us) |
| Schedule 2、3、4 CD | 處方有效期 **28 天**（由簽署日或處方指定起始日起算） | [NHS Prescription charges](https://www.nhs.uk/nhs-services/prescriptions/nhs-prescription-charges/) · [CPE 管制藥物配藥指引（2026年4月更新）](https://cpe.org.uk/wp-content/uploads/2025/10/Dispensing-CDs-factsheet-April-26.pdf) |
| Schedule 5 CD | 與一般藥物相同，**6 個月** | [CPE 管制藥物配藥指引（同上）](https://cpe.org.uk/wp-content/uploads/2025/10/Dispensing-CDs-factsheet-April-26.pdf) |
| 混合處方（CD + 非 CD 同一張 FP10） | **逐項計算有效期**：28 天後 CD 項過期，但非 CD 項在 6 個月內仍可配 | [NHSBSA FAQ — KA-01561](https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-01561/en-us) · [Cegedim Pharmacy Manager EPS expiry rules](https://help.cegedimrx.co.uk/pharmacymanager/Content/08_EPS_R2P2_PM83/07_Dispensing/Expiry_rules_for_EPS_prescriptions.htm) |
| 月份進位特例 | 若簽發日「日」大於到期月天數，到期日取該月最後一天（例：3月31日 → 9月30日）；12個月有效期取翌年同日；閏年 2月29日 → 翌年 2月28日；一律 **23:59:59** 到期 | [Cegedim Pharmacy Manager — Expiry rules for EPS prescriptions](https://help.cegedimrx.co.uk/pharmacymanager/Content/08_EPS_R2P2_PM83/07_Dispensing/Expiry_rules_for_EPS_prescriptions.htm) |
| FP10MDA 分次處方（instalment） | 首次須於 28 天內配發；每次治療期一般不超過 **14 天** | [CPE — Dispensing instalment prescriptions for CDs](https://cpe.org.uk/wp-content/uploads/2021/03/CPN_0221_Dispensing-Factsheet-Dispensing-prescriptions-for-Controlled-Drugs.pdf) |
| Schedule 2/3/4 CD 處方量上限 | 一般以 **30 天**為上限（例外情況須臨床理由）；FP10MDA 每次治療期不超過 14 天 | [CPE 管制藥物配藥指引（2026年4月更新）](https://cpe.org.uk/wp-content/uploads/2025/10/Dispensing-CDs-factsheet-April-26.pdf) |
| 緊急供藥（病人要求，一般 POM） | 多數 POM 最多 **30 天**；吸入器/乳膏可給最小製造商包裝 | [CPE — NHS Emergency Supply Framework](https://cpe.org.uk/wp-content/uploads/2013/07/NHS_emergency_supply_framework.doc) · [NHS Nottingham ICB 解釋](https://notts.icb.nhs.uk/your-health/emergency-supply-of-medication/) |
| 緊急供藥（Schedule 1/2/3 CD） | ❌ **不可**緊急供應（癲癇 phenobarbital / phenobarbitone sodium 例外） | [CPE Community Pharmacy Emergency Supply Service Spec 2018](https://cpe.org.uk/wp-content/uploads/2018/07/269177-Service-Spec-2018-2021.pdf) · [Misuse of Drugs Regulations 2001 via legislation.gov.uk](https://www.legislation.gov.uk/uksi/2001/3998/contents) |
| 緊急供藥（Schedule 4/5 CD） | 最多 **5 天** | [Bucks LPC — Controlled Drugs emergency supply](https://www.buckslpc.org/professional/nhs-contract-services-information/controlled-drugs/) |
| 緊急供藥：藥劑師前提決定 | 最終判斷由藥劑師依臨床情況決定；GPhC / RPS MEP 指引 | [GPhC Standards](https://www.pharmacyregulation.org/standards/standards-for-pharmacy-professionals) · [RPS Medicines, Ethics and Practice](https://www.rpharms.com/resources/pharmacy-guides/medicines-ethics-and-practice) |
| 法律根據 | Medicines Act 1968 / Prescription Only Medicines (Human Use) Order 1997 / Misuse of Drugs Regulations 2001 | [legislation.gov.uk — SI 2002/618 UK MDR](https://www.legislation.gov.uk/uksi/2002/618/contents) |

> 📌 **地區差異提示：** 上述規則以**英格蘭 NHS** 為主。蘇格蘭、威爾斯、北愛在服務規格與報銷上有差異，需在設定中可切換（見第 8 節開放問題）。

---

## 3. 整體功能需求（Functional Requirements）

- **FR-1** 分頁式介面，至少 5 個主分頁（BMI / 日期 / 生育 / 臨床劑量 / 病人工具），每頁可獨立運作。
- **FR-2** 全部輸入即時計算（on-the-fly），無需「提交」按鈕；同時提供「清除/重設」。
- **FR-3** 每個結果旁顯示**依據來源連結**與**最後更新日**（規則會隨法規改變）。
- **FR-4** 單位切換：公制/英制（cm/ft-in、kg/st-lb），µmol/L 等。
- **FR-5** 結果可一鍵複製成純文字（方便貼進 PMR / 病歷備註）。
- **FR-6** 完全不儲存任何可識別病人身分的資料（見第 7.2 節）；可選擇「本機暫存上一次輸入」但預設關閉。
- **FR-7** PWA：可安裝到手機/平板桌面，且核心計算可離線使用。

---

## 4. 各計算機詳細規格

---

### Tab 1 — BMI 計算機（含 ft/in / st-lb 換算）

**輸入**
- 身高：cm，或 feet + inches（換算：總英吋 = ft×12 + in；cm = 總英吋 × 2.54）
- 體重：kg，或 stones + pounds（換算：kg = 總磅 × 0.453592；1 stone = 14 lb）

**計算**
```
BMI = 體重(kg) / 身高(m)²
```

**輸出 — WHO / NHS 標準分類**

| BMI (kg/m²) | 分類（英文） | 分類（中文） |
|---|---|---|
| < 18.5 | Underweight | 體重過輕 |
| 18.5 – 24.9 | Healthy weight | 健康體重 |
| 25.0 – 29.9 | Overweight | 過重 |
| 30.0 – 34.9 | Obese class I | 肥胖一級 |
| 35.0 – 39.9 | Obese class II | 肥胖二級 |
| ≥ 40.0 | Obese class III | 肥胖三級 |

📋 **合規來源：**
- NHS BMI 分類標準：[NHS — What is the body mass index (BMI)?](https://www.nhs.uk/common-health-questions/lifestyle/what-is-the-body-mass-index-bmi/)
- NICE 肥胖管理指引（NG246）：[NICE NG246 — Overweight and obesity management](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity)

**族裔調整選項（Ethnic minority thresholds）**

> NICE 建議南亞、華裔、其他亞裔、中東、黑非洲及加勒比海裔族群採用**較低切點**：
>
> - 過重介入：BMI ≥ **23** kg/m²（等同一般人口 25 的風險）
> - 肥胖介入：BMI ≥ **27.5** kg/m²（等同一般人口 30 的風險）

📋 **合規來源：**
- [NICE NG246 第 1.9 節 — Ethnic minority BMI thresholds](https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity)
- [NHS Digital — Overweight and obesity by ethnicity (統計依據)](https://digital.nhs.uk/data-and-information/publications/statistical/health-survey-england-additional-analyses/ethnicity-and-health-2011-2019-experimental-statistics/overweight-and-obesity)
- 原始 NICE 公共衛生指引（PH46，2013，2018 年監察更新）：[NICE PH46 surveillance summary](https://www.nice.org.uk/guidance/ng246/evidence/appendix-a1-summary-of-evidence-from-surveillance-ph46-pdf-4847559662)

**介面設計**
- 族裔調整選項：預設**關閉**，可勾選（須顯示 NICE 說明，避免誤解為「重新定義肥胖」）。
- 強制提醒：BMI 不適用於孕婦、高肌肉量人士（如運動員）、18 歲以下（兒童須用 centile chart / UK90 生長曲線）。
- 不提供任何減重藥物/飲食建議，只做分類（避免落入 SaMD 醫療建議範圍）。

---

### Tab 2 — 處方日期 / 有效期計算機 ⭐（核心功能）

此頁是使用者最常用、也最能減少法律風險的功能。分 3 個子頁。

#### 2A. 處方有效期判斷（Prescription validity checker）

**輸入**
- Appropriate date（簽署日 / 處方起始日）：日期選擇器，預設今天
- 藥物類別：下拉選 `非管制藥 / Schedule 5 CD`、`Schedule 2 CD`、`Schedule 3 CD`、`Schedule 4 CD`
- （可選）擬配發日期（預設今天）

**計算邏輯**
- 非 CD / Schedule 5 → 到期日 = appropriate date + 6 個月
- Schedule 2/3/4 → 到期日 = appropriate date + 28 天
- 套用月份進位特例（見 2.1 表）；到期時間 23:59:59
- 顯示：✅ 仍有效（剩 N 天）／❌ 已過期（過期 N 天）

📋 **合規來源（必須全部核對）：**
- [NHS.uk — How long is a prescription valid for?](https://www.nhs.uk/common-health-questions/medicines/how-long-is-a-prescription-valid-for/)
- [NHSBSA FAQ KA-01561](https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-01561/en-us)
- [CPE — Dispensing CDs factsheet（April 2026 版）](https://cpe.org.uk/wp-content/uploads/2025/10/Dispensing-CDs-factsheet-April-26.pdf)
- [Cegedim — EPS expiry rules（月份進位邏輯）](https://help.cegedimrx.co.uk/pharmacymanager/Content/08_EPS_R2P2_PM83/07_Dispensing/Expiry_rules_for_EPS_prescriptions.htm)

---

#### 2B. 混合處方逐項判斷（Mixed FP10 item-by-item checker）

**說明：** 同一張 FP10 可同時含 CD 與非 CD 藥物，到期日必須**逐項計算**，不能以「處方最長有效期」一刀切。

**功能：** 允許加入多個藥物項目，各自選類別，逐項顯示到期日與狀態。

📋 **合規來源：**
- [NHSBSA FAQ KA-01561 — 「each item must have their validity period applied」](https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-01561/en-us)
- [Cegedim — Mixed prescription expiry rules](https://help.cegedimrx.co.uk/pharmacymanager/Content/08_EPS_R2P2_PM83/07_Dispensing/Expiry_rules_for_EPS_prescriptions.htm)

---

#### 2C. 緊急供藥助手（Emergency supply checker）

**用途：** 病人無處方要求時，協助藥劑師快速核對法定條件與可供天數。

**⚠️ 重要設計原則：** 呈現方式為「檢核清單 + 資訊提示」，**非**自動批准工具。最終決定必須由藥劑師做出。

**法定條件 Checklist（必須全部符合才可考慮供應）：**

| # | 條件 | 法律來源 |
|---|---|---|
| 1 | 病人曾獲英國（或 EEA/瑞士）處方人員處方該藥 | [Prescription Only Medicines (Human Use) Order 1997, Art. 8](https://www.legislation.gov.uk/uksi/1997/1830/contents) |
| 2 | 有即時需要，不取得藥物會損害健康 | 同上 |
| 3 | 現在無法及時取得有效處方 | 同上 |
| 4 | 藥劑師認為該供應量在臨床上屬合理 | [GPhC 專業標準](https://www.pharmacyregulation.org/standards/standards-for-pharmacy-professionals) |

**藥物類別與可供上限：**

| 藥物類別 | 可供上限 | 來源 |
|---|---|---|
| 多數 POM（非 CD） | 最多 **30 天** | [NHS Emergency Supply Framework](https://cpe.org.uk/wp-content/uploads/2013/07/NHS_emergency_supply_framework.doc) |
| 吸入器 / 乳膏藥膏 | 最小製造商包裝（1 OP） | [CPE Emergency Supply Service Spec 2018](https://cpe.org.uk/wp-content/uploads/2018/07/269177-Service-Spec-2018-2021.pdf) |
| Schedule 4 / 5 CD | 最多 **5 天** | [Bucks LPC — CD Emergency Supply](https://www.buckslpc.org/professional/nhs-contract-services-information/controlled-drugs/) |
| Schedule 1 / 2 / 3 CD | ❌ **不可供應** | [Misuse of Drugs Regulations 2001](https://www.legislation.gov.uk/uksi/2001/3998/contents) · [CPE Emergency Supply Spec 2018](https://cpe.org.uk/wp-content/uploads/2018/07/269177-Service-Spec-2018-2021.pdf) |
| 癲癇 phenobarbital / phenobarbitone sodium（例外） | 視情況可供（屬 Schedule 3，但有特別豁免） | [CPE Emergency Supply Spec 2018（見 Exceptions 條款）](https://cpe.org.uk/wp-content/uploads/2018/07/269177-Service-Spec-2018-2021.pdf) |

**設定選項：** 可切換英格蘭 / 蘇格蘭 / 威爾斯 / 北愛（服務規格不同，尤其是 NHS funded 部分）。

---

### Tab 3 — 排卵 / 生育週期計算機

> ⚠️ **安全定位聲明（必須顯示於頁面頂部）：** 本分頁屬**一般資訊與週期估算工具**，並非避孕或助孕的臨床指引，計算結果存在個體差異。如需避孕臨床建議，請參閱 FSRH 指引或諮詢藥劑師/醫生。

**共用輸入**
- 上次月經第一天（LMP）：日期選擇器
- 平均週期長度：21–35 天（預設 28）

**模式一：想懷孕（Trying to conceive）**

| 計算項目 | 公式 / 規則 | 來源 |
|---|---|---|
| 下次預期月經 | LMP + 週期天數 | — |
| 估算排卵日 | 下次月經日 − 14 天 | [FSRH 緊急避孕指引（含排卵估算說明）](https://www.fsrh.org/Common/Uploaded%20files/documents/fsrh-guideline-emergency-contraception03dec2020-amendedjuly2023-11jul.pdf) |
| 生育窗（fertile window） | 排卵日前約 **5 天** + 排卵當天（共 6 天）| — |
| Folic acid 提醒 | 備孕期每天服用 **400 µg folic acid**，至妊娠 12 週 | [NHS — Planning your pregnancy](https://www.nhs.uk/pregnancy/trying-for-a-baby/planning-your-pregnancy/) · [NHS — Vitamins in pregnancy](https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/) |

📋 **合規來源（生育窗估算）：**
- [FSRH Clinical Guideline: Fertility Awareness Methods](https://www.fsrh.org/standards-and-guidance/documents/ceuguidancefertilityawarenessmethods/)
- [FSRH — Fertility Awareness page](https://www.fsrh.org/Public/Public/Standards-and-Guidance/Fertility-Awareness-Methods.aspx)

**模式二：週期掌握 / 自然認知（Fertility awareness）**

顯示同樣的週期視覺化，並加入以下**強制安全提示**（不可隱藏）：

> 📢 自然認知法（rhythm method / natural family planning）作為單一避孕方法的可靠性**有限**，典型使用失敗率較高。本工具**不會**將「非生育窗」標示為「安全期」或「可不避孕」。如需有效避孕，請諮詢藥劑師或醫生，並參閱 FSRH 指引。

📋 **合規來源：**
- [FSRH — Fertility Awareness Methods guidance](https://www.fsrh.org/standards-and-guidance/documents/ceuguidancefertilityawarenessmethods/)
- [FSRH — Fertility Awareness information page](https://www.fsrh.org/FRSH_CC/Contraception-Methods/Fertility-Awareness.aspx)

**避孕相關（資訊卡，非自動臨床建議）**

漏服避孕藥：以**互動問答**引導使用者到正確的 FSRH 流程，App 不自行硬編臨床決定。

📋 **指向來源：**
- [FSRH — Combined Hormonal Contraception guideline](https://www.fsrh.org/Public/Public/Standards-and-Guidance/Combined-Hormonal-Contraception.aspx)
- [FSRH — Emergency Contraception guideline（2017，2023年修訂）](https://www.fsrh.org/Common/Uploaded%20files/documents/fsrh-guideline-emergency-contraception03dec2020-amendedjuly2023-11jul.pdf)

---

### Tab 4 — 臨床用藥計算機（給藥劑師專業用途）

> ⚠️ **此分頁最可能觸及 SaMD 法規，務必先做 MHRA 評估（見第 7.3 節）。所有結果以 BNF / BNFc / SPS 為最終依據，本工具不自行給特定藥物劑量。**

---

#### 4A. 腎功能 / 肌酸酐清除率（Creatinine Clearance, CrCl）— Cockcroft-Gault 公式

**適用場景：** DOAC（apixaban、dabigatran、edoxaban、rivaroxaban）、gentamicin、vancomycin 等腎清除藥物的劑量調整。

**公式：**
```
CrCl (mL/min) = (140 − 年齡) × 體重(kg) × (1.23 [男] 或 1.04 [女]) / 血清肌酸酐(µmol/L)
```

**體重選擇（必須讓使用者明確選擇）：**

| 情況 | 建議使用體重 | 備註 |
|---|---|---|
| 正常體重 | Actual body weight（ABW） | — |
| 肥胖（BMI > 30） | Ideal body weight（IBW）或 Adjusted body weight（AdjBW）| C-G 公式在體重極端時準確度下降 |
| 極度消瘦 | ABW（謹慎使用） | 可能高估 CrCl |

📋 **合規來源（必須全部引用）：**
- [NHS SPS — Calculating kidney function（MHRA 推薦 C-G 公式用於 DOAC）](https://www.sps.nhs.uk/articles/calculating-kidney-function/)
- [NHS SPS — DOAC monitoring（明確說明須用 C-G 而非 eGFR）](https://www.sps.nhs.uk/monitorings/doacs-direct-oral-anticoagulants-monitoring/)
- [NHS SPS — Information resources for managing medicines in renal impairment](https://www.sps.nhs.uk/articles/information-resources-for-managing-medicines-in-renal-impairment/)
- [BSW ICB — Electronic tools for CrCl calculation (BMI 調整說明)](https://bswtogether.org.uk/medicines/documents/bsw-guide-electronic-tools-to-support-creatinine-clearance-calculation-for-doacs/)
- [Nottinghamshire APC — Renal function calculation and drug dosing（Nov 2024）](https://www.nottsapc.nhs.uk/media/0krpq0sw/renal-function-calculation-and-drug-dosing.pdf)

**必要警示（不可刪除）：**
1. eGFR 會高估腎功能 → 用於 DOAC 劑量會增加出血風險；應使用 CrCl（C-G）。
2. 肥胖/極瘦時準確度下降，建議同時計算 IBW 版本作參考。
3. 本工具只顯示 CrCl 數值，**不給特定藥物劑量**；請參閱 [BNF](https://bnf.nice.org.uk/) 或 SPS。

---

#### 4B. 體表面積（BSA）— Mosteller 公式

```
BSA (m²) = √( 身高(cm) × 體重(kg) / 3600 )
```

📋 **合規來源：**
- Mosteller RD (1987). NEJM. *(標準臨床公式，廣泛收錄於 BNF)*
- [NHS BNF — 化療劑量計算參考](https://bnf.nice.org.uk/)

---

#### 4C. 兒科按體重劑量（Paediatric mg/kg）

**輸入：** 體重 (kg)、每 kg 劑量 (mg/kg)、每日次數、（可選）單次最大劑量、每日最大劑量

**輸出：** 單次劑量 (mg)、每日總量 (mg)；超過最大劑量時**紅色警示**（不阻止，但顯著提示）

📋 **合規來源：**
- [BNF for Children（BNFc）— 唯一授權來源](https://bnfc.nice.org.uk/)

**介面必須顯示：**
> ⚠️ 計算結果僅供參考，最終劑量須核對 BNFc 適應症、年齡限制及最新版本。

---

#### 4D. 單位與濃度換算（可選）

常用配藥換算，純計算工具，低 SaMD 風險：

- mg ↔ µg（× 1000）
- % w/v ↔ mg/mL（× 10）
- mg/mL ↔ mmol/L（需輸入分子量）
- 靜脈滴速：mL/hr ↔ drops/min（需輸入滴定因子：macro = 20 gtt/mL；micro = 60 gtt/mL）

---

### Tab 5 — 病人 / 服務對象自助工具

> 本草稿假設「patents」為「**patients**」之筆誤，故設為面向病人、易懂的工具。若原意不同，請見第 8 節確認。

---

#### 5A. 預產期計算機（EDD — Expected Date of Delivery）

**公式：Naegele's Rule**
```
預產期（EDD）= LMP + 280 天
即：LMP + 9 個月 + 7 天（或 LMP − 3 個月 + 7 天 + 1 年）
```

- 若週期非 28 天，可按每多 1 天加 1 天、每少 1 天減 1 天調整（偏差 ≤ 7 天）。
- 顯示目前孕週（gestational weeks and days）。

📋 **合規來源：**
- [NHS — Due date calculator & pregnancy weeks](https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/)
- [NHS — Your pregnancy week by week](https://www.nhs.uk/pregnancy/week-by-week/)
- NICE CG62 — Antenatal care for uncomplicated pregnancies：[NICE CG62](https://www.nice.org.uk/guidance/cg62)

**必要提示：** 超聲波掃描結果優先於 LMP 計算；本計算不取代正式產前检查。

---

#### 5B. 酒精單位計算機（UK Units）

**公式：**
```
單位 = 體積(mL) × ABV(%) ÷ 1000
```

**NHS / CMO 指引上限：**

| 指引 | 內容 |
|---|---|
| 每週上限 | 男女均不超過 **14 units** |
| 建議分散 | 分散於 ≥ 3 天，設有多個無酒精日 |
| 禁止「儲備」 | 不應把週限量集中於 1–2 天飲用（binge drinking 定義：男 > 8 units / 女 > 6 units 單次）|

📋 **合規來源：**
- [NHS.uk — Alcohol units（官方公式及 14 units 指引）](https://www.nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/)
- [NHS.uk — The risks of drinking too much](https://www.nhs.uk/live-well/alcohol-advice/the-risks-of-drinking-too-much/)
- [UK Chief Medical Officers' Low Risk Drinking Guidelines（2016，現行版本）](https://www.gov.uk/government/publications/alcohol-consumption-advice-on-low-risk-drinking)
- [Drinkaware — UK CMO low risk drinking guidelines（民間解釋版）](https://www.drinkaware.co.uk/facts/information-about-alcohol/alcohol-and-the-facts/low-risk-drinking-guidelines)

**快選按鈕：** pint 啤酒（568mL）、175mL 紅酒、250mL 紅酒、25mL 烈酒（單份）、35mL 烈酒（大份）

---

#### 5C. 吸煙 Pack-Years 計算機（戒煙服務用）

**公式：**
```
Pack-years = (每日支數 ÷ 20) × 吸煙年數
```

📋 **合規來源：**
- [NHS Stop Smoking services](https://www.nhs.uk/better-health/quit-smoking/find-your-local-stop-smoking-service/)
- [NICE NG209 — Tobacco: preventing uptake, promoting quitting and treating dependence](https://www.nice.org.uk/guidance/ng209)

---

#### 5D. 兒童退燒藥家用劑量速查（可選，高風險，建議後期版本）

⚠️ 此功能因直接涉及兒科藥物劑量，SaMD 風險較高，**建議在第三期且完成 MHRA 評估後才實施**。

如實施，必須：
- 僅顯示 OTC paracetamol / ibuprofen **廠商說明書（SmPC / 包裝說明）**範圍
- 強制提示：依包裝指示、不超量、需要時諮詢藥劑師；ibuprofen 不適用於 < 3 個月嬰兒或腎功能受損者

📋 **合規來源：**
- [NHS — Paracetamol for children](https://www.nhs.uk/medicines/paracetamol-for-children/)
- [NHS — Ibuprofen for children](https://www.nhs.uk/medicines/ibuprofen-for-children/)
- [MHRA — Children's paracetamol / ibuprofen guidance](https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency)

---

## 5. 非功能需求（Non-functional Requirements）

| 類別 | 需求 | 來源 / 標準 |
|---|---|---|
| **無障礙** | 符合 WCAG 2.2 AA；大字體、高對比模式；可全鍵盤操作 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| **裝置** | 手機優先（配藥檯多用手機/平板）；PWA 可離線 | — |
| **效能** | 首屏載入 < 2 秒；計算即時 | — |
| **語言** | 預設英文 UI（職場語言）；可考慮多語介面 | — |
| **可維護性** | 法規參數（28 天、6 個月、14 units 等）集中於 config 文件，標明來源 URL 與版本日期，方便法規更新時同步修改 | — |
| **可追溯** | App 內每條規則旁顯示來源連結與生效日期；版本號對應規則快照 | — |

---

## 6. 建議技術架構（Suggested Stack — 非強制）

- **前端：** React / Next.js（或 Vue），TypeScript；Tailwind CSS
- **日期運算：** date-fns 或 Luxon（**務必正確處理月份進位、閏年、時區**，這是 Tab 2 的核心風險點）
- **PWA：** Service Worker 做離線快取
- **後端：** 無後端亦可（純前端計算，最低風險）；若要登入/審計則加輕量後端
- **測試：** 對 Tab 2 與 Tab 4 寫**完整單元測試**，含邊界個案：
  - 3月31日處方 → 9月30日到期（月份進位）
  - 閏年 2月29日 → 翌年 2月28日
  - 混合處方（CD + 非 CD 同一張）
  - 23:59:59 到期時間邊界

---

## 7. 合規、私隱與免責（必須做）

### 7.1 通用免責聲明（每個結果頁固定顯示，不可隱藏）

> **本工具僅為計算輔助，不構成醫療或藥學建議，不取代藥劑師專業判斷、BNF / BNFc / SmPC / NICE / FSRH 或現行法規。使用者須自行核實結果並承擔專業責任。**

---

### 7.2 資料保護（UK GDPR / DPA 2018）

| 要求 | 細節 | 來源 |
|---|---|---|
| 不收集個人資料 | 預設不收集、不儲存、不傳送任何病人個資；計算在裝置本機完成 | [ICO — UK GDPR Guidance & Resources](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/) |
| 健康資料為特殊類別資料 | 如將來加入任何資料儲存功能，需符合 UK GDPR Article 9 特殊類別資料條件 | [ICO — Special Category Data](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/) |
| Analytics 匿名化 | 若使用 analytics，必須匿名化，並提供 cookie 同意（符合 PECR） | [ICO — Cookies](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/cookies-and-similar-technologies/) |
| 健康 & 社會護理透明度 | 如向病人提供（如 Tab 5），須有清晰私隱聲明 | [ICO — Transparency in health & social care](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/transparency-in-health-and-social-care/) |

---

### 7.3 醫療器材軟件（SaMD）評估 —— 上線前必做

| 風險等級 | 涉及分頁 | 需採取行動 | 官方來源 |
|---|---|---|---|
| **較高風險**（可能屬 SaMD） | Tab 4（CrCl、BSA、兒科劑量）、Tab 2C 緊急供藥助手 | 上線前向 MHRA 或法規顧問確認 SaMD 分類；可能需 UKCA 標示及 MHRA 登記 | [MHRA — Regulating medical devices in the UK](https://www.gov.uk/guidance/regulating-medical-devices-in-the-uk) · [MHRA — Medical device stand-alone software（PDF）](https://assets.publishing.service.gov.uk/media/64a7d22d7a4c230013bba33c/Medical_device_stand-alone_software_including_apps__including_IVDMDs_.pdf) |
| **較低風險**（可能屬一般信息工具） | Tab 1 BMI、Tab 2A/2B 處方日期、Tab 3 生育週期、Tab 5 | 仍建議法規評估；「純計算/換算」且無治療建議，較可能不屬 SaMD，但免責聲明仍必要 | [MHRA — How to comply with legal requirements](https://www.gov.uk/guidance/medical-devices-how-to-comply-with-the-legal-requirements) · [MHRA — Register medical devices](https://www.gov.uk/guidance/register-medical-devices-to-place-on-the-market) |

> ⚠️ **關鍵法規原文：** 醫療器材定義（UK MDR 2002 Regulation 2）包括「software intended by its manufacturer to be used specifically for diagnosis or therapeutic purposes」。一般免責聲明（"this product is not a medical device"）**不能**單獨免除法規責任；MHRA 會從標籤、宣傳材料及實際使用方式整體判斷。

📋 **完整法規文件：**
- [UK Medical Devices Regulations 2002 (SI 2002/618)](https://www.legislation.gov.uk/uksi/2002/618/contents)
- [MHRA — UKCA mark for medical devices](https://www.gov.uk/guidance/medical-devices-conformity-assessment-and-the-ukca-mark)
- [MHRA — Guidance on Class I medical devices](https://www.gov.uk/government/collections/guidance-on-class-1-medical-devices)

---

### 7.4 內容治理（Content Governance）

指定專人（建議：Superintendent Pharmacist 或 IG Lead）定期核對：

| 需核對項目 | 建議頻率 | 主要來源 |
|---|---|---|
| CD 28天規則、緊急供藥規格 | 每季 | [CPE — Dispensing CDs factsheet](https://cpe.org.uk/wp-content/uploads/2025/10/Dispensing-CDs-factsheet-April-26.pdf) |
| NICE BMI 切點（NG246） | 每年 | [NICE NG246](https://www.nice.org.uk/guidance/ng246) |
| CMO 酒精單位指引 | 每年 | [UK CMO Low Risk Drinking Guidelines](https://www.gov.uk/government/publications/alcohol-consumption-advice-on-low-risk-drinking) |
| FSRH 避孕/生育指引 | 每年 | [FSRH Standards & Guidance](https://www.fsrh.org/standards-and-guidance/) |
| SPS 腎功能計算建議 | 每季 | [NHS SPS — Calculating kidney function](https://www.sps.nhs.uk/articles/calculating-kidney-function/) |
| NHS 處方收費規定 | 每年 4 月（NHS年度更新） | [NHS Prescription charges](https://www.nhs.uk/nhs-services/prescriptions/nhs-prescription-charges/) |

---

## 8. 開放問題 / 待釐清（Open Questions — 使用者訪談前必須確認）

1. **"Something for patents…"** —— 本草稿假設為 **patients（病人自助工具）**。若你原意是：
   - 專利/學名藥到期（generic/patent expiry）查詢？
   - 抑或「parents（家長/兒科）」相關工具？
   請確認後調整 Tab 5。
2. **地區範圍** —— 只做英格蘭 NHS，還是要涵蓋蘇格蘭/威爾斯/北愛？（緊急供藥服務規格、報銷機制不同）
3. **目標使用者層級** —— 純藥劑師/技術員專業用，抑或部分功能面向病人？這影響 Tab 4 是否對外開放及免責聲明措辭。
4. **品牌** —— 是否需配合特定連鎖（如 Boots）視覺規範，抑或中立品牌？
5. **SaMD 取態** —— 初版走「純資訊/換算」低風險路線，還是接受法規評估後做完整劑量計算？
6. **額外計算機候選**（使用者訪談確認）：血壓分類（NICE/BHS/ESC）、INR/warfarin 提示、opioid 等效換算（OME）、NEWS2 評分、eGFR CKD-EPI、身高預測（paediatric）等。

---

## 9. 建議開發優先次序（MVP → 後續）

| 期次 | 功能 | 合規風險 | 建議完成條件 |
|---|---|---|---|
| **MVP（第一期）** | Tab 1 BMI · Tab 2A/2B 處方有效期 · Tab 5A/5B/5C 預產期/酒精/pack-years | 低 | 即可開發；Superintendent Pharmacist 覆核 |
| **第二期** | Tab 2C 緊急供藥助手 · Tab 3 生育週期 | 中 | 使用者訪談後確認需求；法律顧問過目免責聲明 |
| **第三期** | Tab 4 臨床劑量計算（CrCl、BSA、mg/kg）| 高 | 必須先完成 MHRA SaMD 法規評估；不建議跳過 |

---

## 附錄 A — 所有官方來源索引（方便驗證）

### A1. 處方有效期 / 管制藥物

| 來源 | URL |
|---|---|
| NHS — How long is a prescription valid? | https://www.nhs.uk/common-health-questions/medicines/how-long-is-a-prescription-valid-for/ |
| NHSBSA FAQ — FP10 time limits | https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-01561/en-us |
| NHS — Prescription charges | https://www.nhs.uk/nhs-services/prescriptions/nhs-prescription-charges/ |
| CPE — Dispensing CDs factsheet（April 2026） | https://cpe.org.uk/wp-content/uploads/2025/10/Dispensing-CDs-factsheet-April-26.pdf |
| CPE — Dispensing CDs (2021 version) | https://cpe.org.uk/wp-content/uploads/2021/03/CPN_0221_Dispensing-Factsheet-Dispensing-prescriptions-for-Controlled-Drugs.pdf |
| CPE — NHS Emergency Supply Framework | https://cpe.org.uk/wp-content/uploads/2013/07/NHS_emergency_supply_framework.doc |
| CPE — Emergency Supply Service Spec 2018 | https://cpe.org.uk/wp-content/uploads/2018/07/269177-Service-Spec-2018-2021.pdf |
| Cegedim — EPS expiry rules | https://help.cegedimrx.co.uk/pharmacymanager/Content/08_EPS_R2P2_PM83/07_Dispensing/Expiry_rules_for_EPS_prescriptions.htm |
| Bucks LPC — CD Emergency Supply | https://www.buckslpc.org/professional/nhs-contract-services-information/controlled-drugs/ |
| NHS Nottingham ICB — Emergency supply of medication | https://notts.icb.nhs.uk/your-health/emergency-supply-of-medication/ |
| Misuse of Drugs Regulations 2001 | https://www.legislation.gov.uk/uksi/2001/3998/contents |
| Prescription Only Medicines Order 1997 | https://www.legislation.gov.uk/uksi/1997/1830/contents |
| London HEE — Legal aspects of prescription writing | https://london.hee.nhs.uk/medicines-management-legal-aspects-prescription-writing |

### A2. BMI / 肥胖

| 來源 | URL |
|---|---|
| NICE NG246 — Overweight and obesity management（2022） | https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity |
| NICE NG246 — PH46 surveillance appendix | https://www.nice.org.uk/guidance/ng246/evidence/appendix-a1-summary-of-evidence-from-surveillance-ph46-pdf-4847559662 |
| NHS Digital — Ethnicity and obesity statistics | https://digital.nhs.uk/data-and-information/publications/statistical/health-survey-england-additional-analyses/ethnicity-and-health-2011-2019-experimental-statistics/overweight-and-obesity |
| NHS — What is BMI? | https://www.nhs.uk/common-health-questions/lifestyle/what-is-the-body-mass-index-bmi/ |

### A3. 腎功能 / CrCl

| 來源 | URL |
|---|---|
| NHS SPS — Calculating kidney function | https://www.sps.nhs.uk/articles/calculating-kidney-function/ |
| NHS SPS — DOAC monitoring | https://www.sps.nhs.uk/monitorings/doacs-direct-oral-anticoagulants-monitoring/ |
| NHS SPS — Renal impairment resources | https://www.sps.nhs.uk/articles/information-resources-for-managing-medicines-in-renal-impairment/ |
| BSW ICB — CrCl electronic tools for DOACs | https://bswtogether.org.uk/medicines/documents/bsw-guide-electronic-tools-to-support-creatinine-clearance-calculation-for-doacs/ |
| Nottinghamshire APC — Renal function & drug dosing（Nov 2024） | https://www.nottsapc.nhs.uk/media/0krpq0sw/renal-function-calculation-and-drug-dosing.pdf |
| NHS Highland — Prescribing in renal impairment | https://www.rightdecisions.scot.nhs.uk/tam-treatments-and-medicines-nhs-highland/adult-therapeutic-guidelines/renal-disorders/prescribing-medicines-in-renal-impairment-guidelines/ |
| BNF（需訂閱） | https://bnf.nice.org.uk/ |
| BNFc（需訂閱） | https://bnfc.nice.org.uk/ |

### A4. 生育 / 排卵 / 妊娠

| 來源 | URL |
|---|---|
| FSRH — Fertility Awareness Methods guideline | https://www.fsrh.org/standards-and-guidance/documents/ceuguidancefertilityawarenessmethods/ |
| FSRH — Fertility Awareness information | https://www.fsrh.org/Public/Public/Standards-and-Guidance/Fertility-Awareness-Methods.aspx |
| FSRH — Emergency Contraception guideline（2017，2023年修訂） | https://www.fsrh.org/Common/Uploaded%20files/documents/fsrh-guideline-emergency-contraception03dec2020-amendedjuly2023-11jul.pdf |
| NHS — Planning your pregnancy | https://www.nhs.uk/pregnancy/trying-for-a-baby/planning-your-pregnancy/ |
| NHS — Vitamins & supplements in pregnancy | https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/ |
| NHS — How and when to take folic acid | https://www.nhs.uk/medicines/folic-acid/how-and-when-to-take-folic-acid/ |
| NHS — Due date calculator | https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/ |
| NICE CG62 — Antenatal care | https://www.nice.org.uk/guidance/cg62 |

### A5. 酒精單位

| 來源 | URL |
|---|---|
| NHS — Calculating alcohol units（含公式） | https://www.nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/ |
| NHS — Risks of drinking too much | https://www.nhs.uk/live-well/alcohol-advice/the-risks-of-drinking-too-much/ |
| UK CMO Low Risk Drinking Guidelines（2016，現行） | https://www.gov.uk/government/publications/alcohol-consumption-advice-on-low-risk-drinking |
| Drinkaware — CMO guidelines explanation | https://www.drinkaware.co.uk/facts/information-about-alcohol/alcohol-and-the-facts/low-risk-drinking-guidelines |

### A6. 戒煙

| 來源 | URL |
|---|---|
| NHS — Stop Smoking services | https://www.nhs.uk/better-health/quit-smoking/find-your-local-stop-smoking-service/ |
| NICE NG209 — Tobacco dependence treatment | https://www.nice.org.uk/guidance/ng209 |

### A7. 合規 / 法規

| 來源 | URL |
|---|---|
| UK Medical Devices Regulations 2002（SI 2002/618） | https://www.legislation.gov.uk/uksi/2002/618/contents |
| MHRA — Regulating medical devices in the UK | https://www.gov.uk/guidance/regulating-medical-devices-in-the-uk |
| MHRA — Medical device stand-alone software（PDF） | https://assets.publishing.service.gov.uk/media/64a7d22d7a4c230013bba33c/Medical_device_stand-alone_software_including_apps__including_IVDMDs_.pdf |
| MHRA — How to comply with legal requirements | https://www.gov.uk/guidance/medical-devices-how-to-comply-with-the-legal-requirements |
| MHRA — Register medical devices | https://www.gov.uk/guidance/register-medical-devices-to-place-on-the-market |
| MHRA — UKCA mark for medical devices | https://www.gov.uk/guidance/medical-devices-conformity-assessment-and-the-ukca-mark |
| GPhC — Standards for pharmacy professionals | https://www.pharmacyregulation.org/standards/standards-for-pharmacy-professionals |
| ICO — UK GDPR guidance & resources | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/ |
| ICO — Special category data | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-rules-on-special-category-data/ |
| ICO — Transparency in health & social care | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/transparency-in-health-and-social-care/ |
| W3C WCAG 2.2 | https://www.w3.org/TR/WCAG22/ |

---

*本文件版本 v0.2，所有法規來源已於 2026 年 6 月查證。正式開發前，請由藥房 Superintendent Pharmacist、Governance Lead 及（如適用）法規顧問覆核。如有法規更新，本文件及計算邏輯必須同步更新。*
