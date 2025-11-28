import type { TreemapNode } from '../DashboardDataService';
import React from 'react';
import ReactECharts from 'echarts-for-react';
import styled from 'styled-components';

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

interface AssetTreemapProps {
    data: TreemapNode;
    currencySymbol: string;
}

export const AssetTreemap: React.FC<AssetTreemapProps> = ({ data, currencySymbol }) => {
    const isDarkTheme = document.body.classList.contains('theme-dark');

    const formatCurrency = (amount: number): string => {
        return `${currencySymbol}${Math.abs(amount).toLocaleString('zh-CN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    const treemapOption = {
        backgroundColor: 'transparent',
        tooltip: {
            formatter: (params: any) => {
                if (params.value) {
                    return `${params.name}<br/>${formatCurrency(params.value)}`;
                }
                return params.name;
            },
        },
        toolbox: {
            show: false,
        },
        series: [
            {
                type: 'treemap',
                data: data.children || [],
                roam: false,
                nodeClick: false,
                breadcrumb: {
                    show: false,
                },
                label: {
                    show: true,
                    formatter: (params: any) => {
                        if (params.value) {
                            return `${params.name}\n${formatCurrency(params.value)}`;
                        }
                        return params.name;
                    },
                    color: '#fff',
                    fontSize: 12,
                },
                upperLabel: {
                    show: true,
                    height: 30,
                    color: isDarkTheme ? '#dcddde' : '#2e3338',
                },
                itemStyle: {
                    borderColor: isDarkTheme ? '#1a1a1a' : '#fff',
                    borderWidth: 2,
                    gapWidth: 2,
                },
                levels: [
                    {
                        itemStyle: {
                            borderColor: isDarkTheme ? '#1a1a1a' : '#fff',
                            borderWidth: 2,
                            gapWidth: 2,
                        },
                        upperLabel: {
                            show: false,
                        },
                    },
                    {
                        itemStyle: {
                            borderColor: isDarkTheme ? '#2a2a2a' : '#f0f0f0',
                            borderWidth: 2,
                            gapWidth: 1,
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#3498db',
                            },
                        },
                    },
                    {
                        colorSaturation: [0.35, 0.5],
                        itemStyle: {
                            borderWidth: 1,
                            gapWidth: 1,
                            borderColorSaturation: 0.6,
                        },
                    },
                ],
                visualMap: {
                    show: false,
                    min: 0,
                    max: 100000,
                    inRange: {
                        color: ['#3498db', '#2ecc71', '#f39c12'],
                    },
                },
            },
        ],
    };

    return (
        <div>
            <ChartTitle>资产结构</ChartTitle>
            <ChartContainer>
                <ReactECharts
                    option={treemapOption}
                    style={{ height: '400px' }}
                    opts={{ renderer: 'svg' }}
                />
            </ChartContainer>
        </div>
    );
};
