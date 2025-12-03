import type { TrendData } from '../DashboardDataService';
import * as echarts from 'echarts';
import React from 'react';
import ReactECharts from 'echarts-for-react';
import styled from 'styled-components';
import { getChartColors, observeThemeChange } from '../theme-utils';

const ChartContainer = styled.div`
  width: 100%;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 16px;
`;

const ChartTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--text-normal);
`;

interface TrendChartProps {
    data: TrendData;
    currencySymbol: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, currencySymbol }) => {
    const [refreshKey, setRefreshKey] = React.useState(0);

    // Listen for theme changes
    React.useEffect(() => {
        const cleanup = observeThemeChange(() => {
            setRefreshKey(prev => prev + 1); // Force re-render
        });
        return cleanup;
    }, []);

    const formatCurrency = (amount: number): string => {
        return `${currencySymbol}${Math.abs(amount).toLocaleString('zh-CN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    // X轴：日期（1-31）
    const trendDates = data.dailyIncome.map((item) =>
        window.moment(item.date).format('D'),
    );
    const incomeValues = data.dailyIncome.map((item) => item.amount);
    const expenseValues = data.dailyExpense.map((item) => item.amount);

    // Calculate cumulative balance
    const cumulativeBalance: number[] = [];
    let runningBalance = 0;
    data.dailyIncome.forEach((item, index) => {
        runningBalance += item.amount - data.dailyExpense[index].amount;
        cumulativeBalance.push(runningBalance);
    });

    const trendOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999',
                },
            },
            formatter: (params: any) => {
                let result = `${params[0].axisValue}日<br/>`;
                params.forEach((item: any) => {
                    result += `${item.marker}${item.seriesName}: ${formatCurrency(item.value)}<br/>`;
                });
                return result;
            },
        },
        legend: {
            data: ['总收入', '总支出', '结余'],
            top: 'top',
            left: 'center',
            textStyle: {
                color: getChartColors().text,  // Dynamic color
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                data: trendDates,
                axisPointer: {
                    type: 'shadow',
                },
                axisLabel: {
                    color: getChartColors().text,  // Dynamic color
                },
                axisLine: {
                    lineStyle: {
                        color: getChartColors().axis,  // Dynamic color
                    },
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                name: '金额',
                nameTextStyle: {
                    color: getChartColors().text,  // Dynamic color
                },
                axisLabel: {
                    formatter: (value: number) => formatCurrency(value),
                    color: getChartColors().text,  // Dynamic color
                },
                axisLine: {
                    lineStyle: {
                        color: getChartColors().axis,  // Dynamic color
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: getChartColors().split,  // Dynamic color
                    },
                },
            },
            {
                type: 'value',
                name: '结余',
                nameTextStyle: {
                    color: getChartColors().text,  // Dynamic color
                },
                axisLabel: {
                    formatter: (value: number) => formatCurrency(value),
                    color: getChartColors().text,  // Dynamic color
                },
                axisLine: {
                    lineStyle: {
                        color: getChartColors().axis,  // Dynamic color
                    },
                },
                splitLine: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: '总收入',
                type: 'bar',
                data: incomeValues,
                itemStyle: {
                    color: '#2ecc71',
                },
            },
            {
                name: '总支出',
                type: 'bar',
                data: expenseValues,
                itemStyle: {
                    color: '#e74c3c',
                },
            },
            {
                name: '结余',
                type: 'line',
                yAxisIndex: 1,
                data: cumulativeBalance,
                smooth: true,
                itemStyle: {
                    color: '#3498db',
                },
                lineStyle: {
                    width: 3,
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(52, 152, 219, 0.3)',
                        },
                        {
                            offset: 1,
                            color: 'rgba(52, 152, 219, 0.05)',
                        },
                    ]),
                },
            },
        ],
    };

    return (
        <div>
            <ChartTitle>趋势分析</ChartTitle>
            <ChartContainer>
                <ReactECharts
                    option={trendOption}
                    style={{ height: '350px' }}
                    opts={{ renderer: 'svg' }}
                />
            </ChartContainer>
        </div>
    );
};
