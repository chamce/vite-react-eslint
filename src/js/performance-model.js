/*
    All metrics are calculated the same except bachelors  degrees. 
*/
// const data = require('./generated/data.json'); // must be forward slashes.
// //console.log(data['URM Bachelor Degrees']);
// const base_dollars = require('./generated/base_dollars.json');
// // console.log(base_dollars);
// const dollars = require('./generated/allocation_dollars.json');
// const institutions = require('./generated/institutions.json');
// const weights = require('./generated/weights.json');

/*
 **  Use:
 **  var p = new PerformanceModel(institutions, allocation_dollars, weights, metricData);
 **  p.buildModel("2020-21");
 **  console.log(p.getModelAsArray());
 */

export class PerformanceModel {
  institutions = null;
  base_dollars = null;
  dollars = null;
  weights = null;
  metrics = null;
  adjusted_weights = null;
  adjusted_dollars = null;
  new_money = 0;
  model = {};

  base_dollars_copy = null;

  constructor(
    institutions,
    dollars,
    base_dollars,
    weights,
    metricData,
    new_money
  ) {
    this.institutions = institutions;
    this.base_dollars = base_dollars;
    this.dollars = dollars;
    this.weights = weights;
    this.metrics = metricData;
    this.new_money = new_money;
    this.adjusted_weights = JSON.parse(JSON.stringify(weights));
    this.adjusted_dollars = JSON.parse(JSON.stringify(dollars));
    this.base_dollars_copy = JSON.parse(JSON.stringify(base_dollars));

    this.createDirectCostMetric();
  }

  setNewMoney(new_money) {
    this.new_money = new_money;
  }

  createDirectCostMetric() {
    let instr_exp = this.metrics["Instructional Expenses"];
    let ss_exp = this.metrics["Student Service Expenses"];
    let institutions = Object.keys(instr_exp);
    let DirectCostObj = {};
    // console.log(DirectCostObj);
    for (let i = 0; i < institutions.length; i++) {
      let m1 = instr_exp[institutions[i]];
      let m2 = ss_exp[institutions[i]];

      let newArr = [];
      for (let j = 0; j < m1.length; j++) {
        let year = m1[j].Data_Year;
        let m2_year_dat = m2.filter(function (el) {
          return el.Data_Year === year;
        });
        let newObj = JSON.parse(JSON.stringify(m1[j]));
        newObj.metric = "Direct Cost";
        newObj.Metric_Value = m1[j].Metric_Value + m2_year_dat[0].Metric_Value;
        // console.log(newObj);
        newArr.push(newObj);
      }
      // DirectCostObj["Direct Cost"][institutions[i]] = "test";
      DirectCostObj[institutions[i]] = JSON.parse(JSON.stringify(newArr));
      // DirectCostObj["Direct Cost"][institutions[i]] = newArr;
      // console.log(newArr);
    }
    //console.log(DirectCostObj.EKU[0]);
    // DirectCostObj["Direct Cost"] =JSON.parse(JSON.stringify(institutionalObj));
    this.metrics["Direct Cost"] = JSON.parse(JSON.stringify(DirectCostObj));
    // console.log(this.metrics);
  }

  clearModel() {
    this.model = {};
  }

  adjustWeightsAndDollar(allocation_year) {
    // This is only used for testing.
    let weights = this.adjusted_weights;
    let keys = Object.keys(weights);
    for (let i = 0; i < keys.length; i++) {
      let weight = weights[keys[i]];
      weight[0]["Research_Universities"] = 1;
    }
    // console.log(this.adjusted_weights);
    let dollars = this.adjusted_dollars;
    keys = Object.keys(dollars);
    for (let i = 0; i < keys.length; i++) {
      let metric = dollars[keys[i]];
      let keys2 = Object.keys(metric);
      // value[allocation_year][0] = 1;
      for (let j = 0; j < keys2.length; j++) {
        let inst = metric[keys2[j]][allocation_year][0];
        if (keys[i] === "Small School Adjustment") {
          inst.Amount = 0;
        }
        if (keys[i] === "Allocation Dollars") {
          inst.Amount = inst.Amount * 1.2;
        }
        // console.log(inst);
      }
    }
    // console.log(this.adjusted_dollars);
  }

  setAdjustedWeights(weights) {
    // You can make adjustments to the adjusted weights object.
    this.adjusted_weights = JSON.parse(JSON.stringify(weights));
  }

  setAdjustedDollars(dollars) {
    // You can make adjustments to the adjusted dollars object.
    this.adjusted_dollars = JSON.parse(JSON.stringify(dollars));
  }

  roundHundreds(value) {
    return Math.round(value / 100) * 100;
  }

  roundWhole(value) {
    return Math.round(value);
  }

  compareFields(fields1, fields2) {
    // fields1 = array of strings
    // fields2 = array of strings
    // Compare the array of strings, if found, remove it from fields2.
    for (let i = 0; i < fields1.length; i++) {
      let test = fields2.includes(fields1[i]);
      if (test === true) fields2.splice(fields2.indexOf(fields1[i]), 1);
    }
  }

  getDataYears(allocation_year) {
    // allocation_year should be in this format 2022-23.
    // will return an array of size 3 of data years in the same format as allocation_year.
    // try {
    //     allocation_year_test(allocation_year);
    // } catch (e) {
    //     console.error(e);
    //     return [];
    // }

    let year1 = parseInt(allocation_year.substring(0, 4)) - 2;
    let year2 = parseInt(allocation_year.substring(5)) - 2;
    let data_years = [];
    for (let i = 0; i < 3; i++) {
      let data_year1 = year1 - i;
      let data_year2 = year2 - i;
      let data_year = data_year1.toString() + "-" + data_year2.toString();
      data_years.push(data_year);
    }
    return data_years;
  }

  getDataFalls(allocation_year) {
    // allocation_year should be in this format 2022-23.
    // will return an array of size 3 of fall years in the format Fall 2020.
    // try {
    //     allocation_year_test(allocation_year);
    // } catch (e) {
    //     console.error(e);
    //     return [];
    // }

    let year1 = parseInt(allocation_year.substring(0, 4)) - 2;
    let data_falls = [];
    for (let i = 0; i < 3; i++) {
      let data_year1 = year1 - i;
      let data_fall = "Fall " + data_year1.toString();
      data_falls.push(data_fall);
    }
    return data_falls;
  }

  isMetricYearBased(metricObj) {
    let institutions = Object.keys(metricObj);
    if (metricObj[institutions[0]][0].Data_Year !== "") return true;
    return false;
  }

  rollupByYear(data) {
    /*
    data should look like this. 
    {
        EKU: {
            '2020-21': 24.17090796950901,
            '2019-20': 25.633240298490033,
            '2018-19': 24.798317770622013
        },
        KSU: {
            '2020-21': 9.98999573284468,
            '2019-20': 10.49502826763088,
            '2018-19': 18.149597198798016
        }, 
        ...
    }
    */
    let institutions = Object.keys(data);
    let first_inst = data[institutions[0]];
    let time_keys = Object.keys(first_inst);
    //console.log(time_keys);
    //time_keys = time_keys.splice(time_keys.indexOf('Total'), 1);
    //time_keys = time_keys.splice(time_keys.indexOf('Average'), 1);

    let summary = {};
    for (let i = 0; i < time_keys.length; i++) summary[time_keys[i]] = 0;
    //console.log(summary);
    for (let i = 0; i < institutions.length; i++) {
      let inst = data[institutions[i]];
      //console.log(inst);
      for (let j = 0; j < time_keys.length; j++)
        summary[time_keys[j]] = summary[time_keys[j]] + inst[time_keys[j]];
    }
    //console.log(summary);
    return summary;
  }

  getMetricData(metric, allocation_year) {
    let metric_data = this.metrics[metric];
    // let Data_Falls = this.getDataFalls(allocation_year);
    let institutions = Object.keys(metric_data);
    let yearBased = this.isMetricYearBased(metric_data);
    let returnObjArry = {};
    if (yearBased === true) {
      let Data_Years = this.getDataYears(allocation_year);
      for (let i = 0; i < institutions.length; i++) {
        let obj = {};

        obj.Institution = institutions[i];
        obj.Metric = metric;
        let inst = metric_data[obj.Institution].filter(function (el) {
          return Data_Years.includes(el.Data_Year);
        });

        obj.Sum = 0;
        obj.NumOfValues = 0;
        for (let j = 0; j < inst.length; j++) {
          if (inst[j].Metric_Value != null) {
            obj[inst[j].Data_Year] = inst[j].Metric_Value;
            obj.Sum += inst[j].Metric_Value;
            obj.NumOfValues += 1;
          }
        }
        obj.Average = obj.Sum / obj.NumOfValues;
        returnObjArry[institutions[i]] = obj;
      }
    } else {
      let Data_Falls = this.getDataFalls(allocation_year);
      for (let i = 0; i < institutions.length; i++) {
        let obj = {};
        obj.Institution = institutions[i];
        obj.Metric = metric;
        let inst = metric_data[obj.Institution].filter(function (el) {
          return Data_Falls.includes(el.Data_Fall);
        });

        obj.Sum = 0;
        obj.NumOfValues = 0;
        for (let j = 0; j < inst.length; j++) {
          if (inst[j].Metric_Value != null) {
            obj[inst[j].Data_Fall] = inst[j].Metric_Value;
            obj.Sum += inst[j].Metric_Value;
            obj.NumOfValues += 1;
          }
        }
        obj.Average = obj.Sum / obj.NumOfValues;
        returnObjArry[institutions[i]] = obj;
      }
    }
    return returnObjArry;
  }

  addInstitutionInfo(
    institution,
    institutionObj,
    fieldsArr = null,
    overwrite = false
  ) {
    // appends the institution fields to institutionObj.
    // institution = a string (EKU, WKU, NKY, etc..)
    // institutionObj = an object {}
    // fields = an array of fields to get. If null get them all.
    //let metricObj = weights[metric][0];
    let inst = this.institutions[institution][0];
    if (fieldsArr === null) {
      fieldsArr = Object.keys(inst);
    }

    // make sure not to overwrite fields that already exist.
    if (overwrite === false)
      this.compareFields(Object.keys(institutionObj), fieldsArr);

    for (let i = 0; i < fieldsArr.length; i++) {
      institutionObj[fieldsArr[i]] = inst[fieldsArr[i]];
    }
  }

  addWeights(obj, metric) {
    // Adds base weights and adjusted weights to data.
    // obj should be like this
    // { "EKU":{}, "WKU":{} }
    let weight = this.weights[metric][0];
    let adjusted_weight = this.adjusted_weights[metric][0];
    // console.log(weight);
    let institutions = Object.keys(obj);
    for (let i = 0; i < institutions.length; i++) {
      this.addInstitutionInfo(institutions[i], obj[institutions[i]]);
      if (obj[institutions[i]].Type === "Comprehensive") {
        obj[institutions[i]].Weight = weight.Comprehensive_Universities;
        obj[institutions[i]].Adjusted_Weight =
          adjusted_weight.Comprehensive_Universities;
      } else if (obj[institutions[i]].Type === "Research") {
        obj[institutions[i]].Weight = weight.Research_Universities;
        obj[institutions[i]].Adjusted_Weight =
          adjusted_weight.Research_Universities;
      }
      obj[institutions[i]].Metric = weight.Funding_Model_Metrics;
      obj[institutions[i]].Component_Level_1 = weight.Component_Level_1;
      obj[institutions[i]].Component_Level_2 = weight.Component_Level_2;
      obj[institutions[i]].Percent_of_Allocation = weight.Percent_of_Allocation;
      obj[institutions[i]].Adjusted_Percent_of_Allocation =
        adjusted_weight.Percent_of_Allocation;
    }
    // console.log(obj);
  }

  modelCalculations(obj) {
    let institutions = Object.keys(obj);
    for (let i = 0; i < institutions.length; i++) {
      let inst = obj[institutions[i]];
      let dollarsForGrabs =
        inst.Percent_of_Allocation * inst.Total_Allocated_Dollars_by_all_Inst;
      inst.Model_Dollars = this.roundHundreds(
        dollarsForGrabs * inst.Weighted_Average_Percent_Share
      );

      dollarsForGrabs =
        inst.Adjusted_Percent_of_Allocation *
        inst.Total_Adj_Allocated_Dollars_by_all_Inst;
      inst.Adjusted_Model_Dollars = this.roundHundreds(
        dollarsForGrabs * inst.Adjusted_Weighted_Average_Percent_Share
      );

      inst.Model_Contribution = this.roundHundreds(
        inst.Allocated_Dollars_by_Inst * inst.Percent_of_Allocation
      );
      inst.Model_Plus_Minus = inst.Model_Dollars - inst.Model_Contribution;
      inst.Adjusted_Model_Contribution = this.roundHundreds(
        inst.Adjusted_Allocated_Dollars_by_Inst *
          inst.Adjusted_Percent_of_Allocation
      );
      inst.Adjusted_Model_Plus_Minus =
        inst.Adjusted_Model_Dollars - inst.Adjusted_Model_Contribution;
    }
    // console.log(obj);
  }

  addInstitutionAllocationAmounts(obj, allocation_year) {
    let institutions = Object.keys(obj);
    let dollars = this.dollars["Allocation Dollars"];
    let adj_dollars = this.adjusted_dollars["Allocation Dollars"];
    for (let i = 0; i < institutions.length; i++) {
      obj[institutions[i]].Allocated_Dollars_by_Inst =
        dollars[institutions[i]][allocation_year][0].Amount;
      obj[institutions[i]].Adjusted_Allocated_Dollars_by_Inst =
        adj_dollars[institutions[i]][allocation_year][0].Amount;
    }

    dollars = this.dollars["Small School Adjustment"];
    adj_dollars = this.adjusted_dollars["Small School Adjustment"];
    for (let i = 0; i < institutions.length; i++) {
      obj[institutions[i]].Small_School_Adjustment_by_Inst =
        dollars[institutions[i]][allocation_year][0].Amount;
      obj[institutions[i]].Adjusted_Small_School_Adjustment_by_Inst =
        adj_dollars[institutions[i]][allocation_year][0].Amount;
    }

    dollars = this.dollars["Adjusted Net General Fund"];
    adj_dollars = this.adjusted_dollars["Adjusted Net General Fund"];
    for (let i = 0; i < institutions.length; i++) {
      obj[institutions[i]].Adjusted_Net_General_Fund_by_Inst =
        dollars[institutions[i]][allocation_year][0].Amount;
      obj[institutions[i]].Adjusted_Adjusted_Net_General_Fund_by_Inst =
        adj_dollars[institutions[i]][allocation_year][0].Amount;
    }
  }

  addTotalAllocatedDollars(obj, allocation_year) {
    let allocation_dollars = this.dollars["Allocation Dollars"];
    //console.log(allocation_dollars);
    let institutions = Object.keys(allocation_dollars);
    let allocation_dollars_total = 0;
    for (let i = 0; i < institutions.length; i++) {
      allocation_dollars_total +=
        allocation_dollars[institutions[i]][allocation_year][0].Amount;
    }

    allocation_dollars = this.adjusted_dollars["Allocation Dollars"];
    let adj_allocation_dollars_total = 0;
    for (let i = 0; i < institutions.length; i++) {
      adj_allocation_dollars_total +=
        allocation_dollars[institutions[i]][allocation_year][0].Amount;
    }

    for (let i = 0; i < institutions.length; i++) {
      obj[institutions[i]].Total_Allocated_Dollars_by_all_Inst =
        allocation_dollars_total;
      obj[institutions[i]].Total_Adj_Allocated_Dollars_by_all_Inst =
        adj_allocation_dollars_total;
    }

    // console.log(obj);
    // console.log(allocation_dollars_total + ',' + adj_allocation_dollars_total);
  }

  Bachelors(allocation_year) {
    let bach_degrees = this.getMetricData("Bachelor Degrees", allocation_year);
    let ug_fte = this.getMetricData("UG FTE", allocation_year);
    let institutions = Object.keys(bach_degrees);
    // console.log(ugfte);
    let data_years = this.getDataYears(allocation_year);
    let data_falls = this.getDataFalls(allocation_year);

    // Degrees per 100 FTE
    let degrees_per100_FTE = {};
    for (let i = 0; i < institutions.length; i++) {
      let bachs = bach_degrees[institutions[i]];
      let fte = ug_fte[institutions[i]];
      degrees_per100_FTE[institutions[i]] = {};
      let institution = degrees_per100_FTE[institutions[i]];
      for (let j = 0; j < data_years.length; j++) {
        institution[data_years[j]] =
          bachs[data_years[j]] / (fte[data_falls[j]] / 100);
      }
    }
    // console.log(degrees_per100_FTE)

    let bach_totals = this.rollupByYear(bach_degrees);
    let ug_fte_totals = this.rollupByYear(ug_fte);
    let degrees_per100_FTE_totals = {};
    for (let i = 0; i < data_years.length; i++) {
      degrees_per100_FTE_totals[data_years[i]] =
        bach_totals[data_years[i]] / (ug_fte_totals[data_falls[i]] / 100);
    }
    // console.log(degrees_per100_FTE_totals);

    // Degrees per 100 index.
    let degrees_per100_Index = {};
    for (let i = 0; i < institutions.length; i++) {
      let inst_degress_per100 = degrees_per100_FTE[institutions[i]];
      degrees_per100_Index[institutions[i]] = {};
      let inst = degrees_per100_Index[institutions[i]];
      for (let j = 0; j < data_years.length; j++) {
        let year = data_years[j];
        inst[year] =
          inst_degress_per100[year] / degrees_per100_FTE_totals[year];
      }
    }
    // console.log(degrees_per100_Index);

    // Normalized Degrees Per 100 FTE Index
    let normalized_bach = {};
    let average_total = 0;
    for (let i = 0; i < institutions.length; i++) {
      let bachs = bach_degrees[institutions[i]];
      let index = degrees_per100_Index[institutions[i]];
      normalized_bach[institutions[i]] = {};
      let inst = normalized_bach[institutions[i]];
      let total = 0;
      for (let j = 0; j < data_years.length; j++) {
        let year = data_years[j];
        inst[year] = bachs[year] * index[year];
        total += inst[year];
      }
      inst.Average = total / data_years.length;
      average_total += inst.Average;
    }
    for (let i = 0; i < institutions.length; i++) {
      normalized_bach[institutions[i]].Average_Total = average_total;
    }
    this.addWeights(normalized_bach, "Bach");

    let Weighted_Average_Total = 0;
    let Adjusted_Weighted_Average_Total = 0;
    for (let i = 0; i < institutions.length; i++) {
      normalized_bach[institutions[i]].Weighted_Average =
        normalized_bach[institutions[i]].Weight *
        normalized_bach[institutions[i]].Average;
      normalized_bach[institutions[i]].Adjusted_Weighted_Average =
        normalized_bach[institutions[i]].Adjusted_Weight *
        normalized_bach[institutions[i]].Average;
      Weighted_Average_Total +=
        normalized_bach[institutions[i]].Weighted_Average;
      Adjusted_Weighted_Average_Total +=
        normalized_bach[institutions[i]].Adjusted_Weighted_Average;
    }
    for (let i = 0; i < institutions.length; i++) {
      normalized_bach[institutions[i]].Weighted_Average_Total =
        Weighted_Average_Total;
      // normalized_bach[institutions[i]].Weighted_Share = normalized_bach[institutions[i]].Weighted_Average/Weighted_Average_Total;
      normalized_bach[institutions[i]].Weighted_Average_Percent_Share =
        normalized_bach[institutions[i]].Weighted_Average /
        Weighted_Average_Total;
      if (this.new_money != null)
        normalized_bach[institutions[i]].New_Money_Distribution =
          normalized_bach[institutions[i]].Weighted_Average_Percent_Share *
          normalized_bach[institutions[i]].Percent_of_Allocation *
          this.new_money;

      normalized_bach[institutions[i]].Adjusted_Weighted_Average_Total =
        Adjusted_Weighted_Average_Total;
      // normalized_bach[institutions[i]].Adjusted_Weighted_Share = normalized_bach[institutions[i]].Adjusted_Weighted_Average/Adjusted_Weighted_Average_Total;
      normalized_bach[institutions[i]].Adjusted_Weighted_Average_Percent_Share =
        normalized_bach[institutions[i]].Adjusted_Weighted_Average /
        Adjusted_Weighted_Average_Total;
      if (this.new_money != null)
        normalized_bach[institutions[i]].Adjusted_New_Money_Distribution =
          normalized_bach[institutions[i]]
            .Adjusted_Weighted_Average_Percent_Share *
          normalized_bach[institutions[i]].Adjusted_Percent_of_Allocation *
          this.new_money;
    }

    // console.log(normalized_bach);
    this.addTotalAllocatedDollars(normalized_bach, allocation_year);
    this.addInstitutionAllocationAmounts(normalized_bach, allocation_year);
    this.modelCalculations(normalized_bach);
    //console.log(normalized_bach);
    //return normalized_bach;
    this.model["Bachelor's Degrees (Normalized)"] = normalized_bach;
  }

  StandardMetricCalc(metric, weight, allocation_year) {
    let metricValues = this.getMetricData(metric, allocation_year);
    let institutions = Object.keys(metricValues);
    // console.log(institutions);

    this.addWeights(metricValues, weight);
    let Weighted_Average_Total = 0;
    let Adjusted_Weighted_Average_Total = 0;
    for (let i = 0; i < institutions.length; i++) {
      metricValues[institutions[i]].Weighted_Average =
        metricValues[institutions[i]].Weight *
        metricValues[institutions[i]].Average;
      metricValues[institutions[i]].Adjusted_Weighted_Average =
        metricValues[institutions[i]].Adjusted_Weight *
        metricValues[institutions[i]].Average;
      Weighted_Average_Total += metricValues[institutions[i]].Weighted_Average;
      Adjusted_Weighted_Average_Total +=
        metricValues[institutions[i]].Adjusted_Weighted_Average;
    }
    for (let i = 0; i < institutions.length; i++) {
      metricValues[institutions[i]].Weighted_Average_Total =
        Weighted_Average_Total;
      //metricValues[institutions[i]].Weighted_Share = metricValues[institutions[i]].Weighted_Average/Weighted_Average_Total;
      metricValues[institutions[i]].Weighted_Average_Percent_Share =
        metricValues[institutions[i]].Weighted_Average / Weighted_Average_Total;
      if (this.new_money !== null) {
        // console.log(this.new_money);
        metricValues[institutions[i]].New_Money_Distribution =
          metricValues[institutions[i]].Weighted_Average_Percent_Share *
          metricValues[institutions[i]].Percent_of_Allocation *
          this.new_money;
      }

      metricValues[institutions[i]].Adjusted_Weighted_Average_Total =
        Adjusted_Weighted_Average_Total;
      // metricValues[institutions[i]].Adjusted_Weighted_Share = metricValues[institutions[i]].Adjusted_Weighted_Average/Adjusted_Weighted_Average_Total;
      metricValues[institutions[i]].Adjusted_Weighted_Average_Percent_Share =
        metricValues[institutions[i]].Adjusted_Weighted_Average /
        Adjusted_Weighted_Average_Total;
      if (this.new_money !== null)
        metricValues[institutions[i]].Adjusted_New_Money_Distribution =
          metricValues[institutions[i]]
            .Adjusted_Weighted_Average_Percent_Share *
          metricValues[institutions[i]].Adjusted_Percent_of_Allocation *
          this.new_money;
    }
    // console.log(metricValues["EKU"]);
    this.addTotalAllocatedDollars(metricValues, allocation_year);
    this.addInstitutionAllocationAmounts(metricValues, allocation_year);
    this.modelCalculations(metricValues);
    this.model[this.weights[weight][0].Funding_Model_Metrics] = metricValues;
  }

  buildModel(allocation_year) {
    this.Bachelors(allocation_year);
    this.StandardMetricCalc("URM Bachelor Degrees", "BachURM", allocation_year);
    // console.log(this.model);
    this.StandardMetricCalc(
      "Low Income Bachelor Degrees",
      "BachLI",
      allocation_year
    );
    this.StandardMetricCalc(
      "STEMH Bachelor Degrees",
      "BachStem",
      allocation_year
    );
    this.StandardMetricCalc("Progress to 30 hours", "P30", allocation_year);
    this.StandardMetricCalc("Progress to 60 hours", "P60", allocation_year);
    this.StandardMetricCalc("Progress to 90 hours", "P90", allocation_year);
    this.StandardMetricCalc(
      "Credit Hours Weighted",
      "CreditHrs",
      allocation_year
    );
    this.StandardMetricCalc("Square Feet", "SqFeet", allocation_year);
    this.StandardMetricCalc("Direct Cost", "Costs", allocation_year);
    this.StandardMetricCalc("Total FTE", "FTE", allocation_year);
    // console.log(this.model['Instruction and Student Services Costs']['EKU']);
    // console.log(this.model);
    //console.log(this.metrics);
    this.ComputeBaseDollars();
  }

  getModel() {
    return this.model;
  }

  getModelAsArray() {
    let metrics = Object.keys(this.model);
    // console.log(metrics);
    // return;
    let outputArr = [];
    for (let i = 0; i < metrics.length; i++) {
      let metric = this.model[metrics[i]];
      let institutions = Object.keys(metric);
      for (let j = 0; j < institutions.length; j++) {
        let inst = metric[institutions[j]];
        outputArr.push(inst);
      }
    }
    return outputArr;
  }

  DisbursementRatios(metric, weight, allocation_year, new_money) {
    // this method is not used but did help me determine what was required.
    //console.log(this.metrics[metric]);
    let metricValues = this.getMetricData(metric, allocation_year);
    let institutions = Object.keys(metricValues);
    //console.log(metricValues);

    this.addWeights(metricValues, weight);
    let Weighted_Average_Total = 0;
    let Adjusted_Weighted_Average_Total = 0;
    for (let i = 0; i < institutions.length; i++) {
      metricValues[institutions[i]].Weighted_Average =
        metricValues[institutions[i]].Weight *
        metricValues[institutions[i]].Average;
      metricValues[institutions[i]].Adjusted_Weighted_Average =
        metricValues[institutions[i]].Adjusted_Weight *
        metricValues[institutions[i]].Average;
      Weighted_Average_Total += metricValues[institutions[i]].Weighted_Average;
      Adjusted_Weighted_Average_Total +=
        metricValues[institutions[i]].Adjusted_Weighted_Average;
    }
    for (let i = 0; i < institutions.length; i++) {
      metricValues[institutions[i]].Weighted_Average_Total =
        Weighted_Average_Total;
      metricValues[institutions[i]].Weighted_Average_Percent_Share =
        metricValues[institutions[i]].Weighted_Average / Weighted_Average_Total;
      metricValues[institutions[i]].New_Money_Distribution =
        metricValues[institutions[i]].Weighted_Average_Percent_Share *
        metricValues[institutions[i]].Percent_of_Allocation *
        new_money;

      metricValues[institutions[i]].Adjusted_Weighted_Average_Total =
        Adjusted_Weighted_Average_Total;
      metricValues[institutions[i]].Adjusted_Weighted_Average_Percent_Share =
        metricValues[institutions[i]].Adjusted_Weighted_Average /
        Adjusted_Weighted_Average_Total;
      metricValues[institutions[i]].Adjusted_New_Money_Distribution =
        metricValues[institutions[i]].Adjusted_Weighted_Average_Percent_Share *
        metricValues[institutions[i]].Adjusted_Percent_of_Allocation *
        new_money;
    }

    //console.log(metricValues["EKU"]);
  }

  PrintNewMoney() {
    // Not implemented!!!!!!!!

    // this.getModelAsArray()
    // console.log(this.getModelAsArray());
    const items = this.model;
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    // console.log(items[0]);
    const header = Object.keys(items[0]);

    const csv = [
      header.join(","), // header row first
      ...items.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      ),
    ].join("\r\n");

    console.log(csv);
  }

  setBaseDollars(inObject) {
    /* inObject 
      { "EKU":25000, "KSU":23000, etc... }
    */
    let institutions = Object.keys(inObject);
    // console.log(this.base_dollars);
    for (let i = 0; i < institutions.length; i++) {
      this.base_dollars["Base"][institutions[i]]["Amount"] =
        inObject[institutions[i]];
    }
    // console.log(this.base_dollars["Base"]);
  }

  setAdditionToBaseDollars(inObject) {
    /* inObject 
      { "EKU":25000, "KSU":23000, etc... }
    */
    let institutions = Object.keys(inObject);
    // console.log(this.base_dollars);
    for (let i = 0; i < institutions.length; i++) {
      this.base_dollars["Addition to Base"][institutions[i]]["Amount"] =
        inObject[institutions[i]];
    }
    // console.log(this.base_dollars["Addition to Base"]);
  }

  resetBaseDollars() {
    this.base_dollars = JSON.parse(JSON.stringify(this.base_dollars_copy));
    // console.log(this.base_dollars["Base"]);
  }

  ComputeBaseDollars() {
    let metrics = Object.keys(this.base_dollars);
    let temp = this.base_dollars[metrics[0]];
    let institutions = Object.keys(temp);

    // Just for testing assign everyone x dollars to base.
    // for (var i=0; i<institutions.length; i++) {
    //   this.base_dollars["Addition to Base"][institutions[i]]["Amount"] = 3000000;
    // }

    // Get the sum of all addition to base.
    let totalAdditionToBase = 0;
    for (let i = 0; i < institutions.length; i++) {
      totalAdditionToBase +=
        this.base_dollars["Addition to Base"][institutions[i]]["Amount"];
    }
    // this.total_addition_to_base = totalAdditionToBase;
    // this.

    for (let i = 0; i < institutions.length; i++) {
      let base = this.base_dollars["Base"][institutions[i]]["Amount"];
      let additionalBase =
        this.base_dollars["Addition to Base"][institutions[i]]["Amount"];
      //let newMoney = this.base_dollars["New Model Money"][institutions[i]]["Amount"];
      //let totalBase = this.base_dollars["Total Base"][institutions[i]]["Amount"];

      this.base_dollars["Total Base"][institutions[i]]["Amount"] =
        base + additionalBase;
      this.base_dollars["New Model Money"][institutions[i]]["Amount"] =
        (this.new_money - totalAdditionToBase) / institutions.length;
      //console.log(totalBase);
    }
    // console.log(this.base_dollars);

    // Combined base dollars with model.
    let modelMetrics = Object.keys(this.model);
    // console.log(modelMetrics);
    for (let i = 0; i < modelMetrics.length; i++) {
      institutions = Object.keys(this.model[modelMetrics[i]]);
      for (let j = 0; j < institutions.length; j++) {
        let m = this.model[modelMetrics[i]][institutions[j]];

        m["+ Base"] = this.roundWhole(
          this.base_dollars["Base"][institutions[j]].Amount
        );
        m["+ Addition to Base"] = this.roundWhole(
          this.base_dollars["Addition to Base"][institutions[j]].Amount
        );
        m["+ Total Base"] = this.roundWhole(
          this.base_dollars["Total Base"][institutions[j]].Amount
        );
        m["+ New Money"] = this.roundWhole(
          this.base_dollars["New Model Money"][institutions[j]].Amount
        );

        m["+ Model Base"] = this.roundWhole(
          m["+ Base"] * m.Percent_of_Allocation
        );
        m["+ Model Addition to Base"] = this.roundWhole(
          m["+ Addition to Base"] * m.Percent_of_Allocation
        );
        m["+ Model Total Base"] = this.roundWhole(
          m["+ Total Base"] * m.Percent_of_Allocation
        );
        m["+ Model New Money Contribution"] = this.roundWhole(
          m["+ New Money"] * m.Percent_of_Allocation
        );
        m["+ Model New Money Share"] = this.roundWhole(
          (this.new_money - totalAdditionToBase) *
            m.Percent_of_Allocation *
            m.Weighted_Average_Percent_Share
        );

        m["+ Adjusted Model Base"] = this.roundWhole(
          m["+ Base"] * m.Adjusted_Percent_of_Allocation
        );
        m["+ Adjusted Model Addition to Base"] = this.roundWhole(
          m["+ Addition to Base"] * m.Adjusted_Percent_of_Allocation
        );
        m["+ Adjusted Model Total Base"] = this.roundWhole(
          m["+ Total Base"] * m.Adjusted_Percent_of_Allocation
        );
        m["+ Adjusted Model New Money Contribution"] = this.roundWhole(
          m["+ New Money"] * m.Adjusted_Percent_of_Allocation
        );
        m["+ Adjusted Model New Money Share"] = this.roundWhole(
          (this.new_money - totalAdditionToBase) *
            m.Adjusted_Percent_of_Allocation *
            m.Adjusted_Weighted_Average_Percent_Share
        );

        // if (i==0 && j==0)
        //   console.log(this.model);
      }
    }
    // console.log(this.model);
  }
}

// Test Code.
// var model = new PerformanceModel(institutions, dollars, base_dollars, weights, data, 75000000);
// model.adjusted_weights.BachURM[0].Percent_of_Allocation = .040;
// console.log(model.adjusted_weights);
// model.DisbursementRatios("URM Bachelor Degrees", "BachURM", "2022-23", 75000000);
// model.setNewMoney(75000000);
// model.StandardMetricCalc("URM Bachelor Degrees", "BachURM", "2022-23");
// model.Bachelors("2022-23");

//model.ComputeBaseDollars();
// model.buildModel("2022-23");

// model.setBaseDollars({"EKU":250000, "KSU":250000, "MoSU":25000, "MuSU":25});
// model.setAdditionToBaseDollars({"EKU":250000, "KSU":250000, "MoSU":25000, "MuSU":25});
// model.resetBaseDollars();

// console.log(model.getModel());
// console.log(model.getModelAsArray());
