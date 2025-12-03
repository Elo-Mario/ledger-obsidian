import type { SankeyData } from '../DashboardDataService';
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

interface SankeyChartProps {
    data: SankeyData;
    currencySymbol: string;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({ data, currencySymbol }) => {
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

    const sankeyOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                if (params.dataType === 'edge') {
                    return `${params.data.source} → ${params.data.target}<br/>${formatCurrency(params.data.value)}`;
                }
                // Show node name with tooltip for nodes
                return `${params.name}`;
            },
        },
        series: [
            {
                type: 'sankey',
                layout: 'none',
                nodeAlign: 'justify',
                layoutIterations: 64,
                emphasis: {
                    focus: 'adjacency',
                },
                // ✅ 对称布局：左右接近对称，右侧稍宽以容纳标签
                left: '4%',
                top: '5%',
                right: '8%',     // 右侧8%，与左侧4%接近对称
                bottom: '5%',
                nodeWidth: 20,
                nodeGap: 10,
                lineStyle: {
                    color: 'gradient',  // 渐变连线
                    curveness: 0.5,
                    opacity: 0.4,
                },
                itemStyle: {
                    borderWidth: 0,
                },
                label: {
                    show: true,
                    position: 'right',
                    distance: 5,      // ✅ 紧凑标签间距
                    color: getChartColors().text,
                    fontSize: 12,
                },
                data: data.nodes.map((node) => {
                    // ✅ 颜色逻辑：使用includes宽松匹配
                    let color = '#9CA3AF';  // 默认灰色

                    const name = node.name || '';

                    // 左侧逻辑
                    if (name.includes('收入') || name.includes('Income')) {
                        color = '#10B981';  // 翡翠绿
                    } else if (name.includes('负债') || name.includes('存量消耗')) {
                        color = '#F43F5E';  // 红色
                    } else if (name.includes('余额消费')) {
                        color = '#3B82F6';  // 蓝色
                    }
                    // 右侧逻辑 - 所有支出类别变绿
                    else if (name.includes('支出') || name.includes('Expense') ||
                        name.includes('保障') || name.includes('餐饮') ||
                        name.includes('购物') || name.includes('通讯') ||
                        name.includes('交通') || name.includes('娱乐') ||
                        name.includes('教育') || name.includes('医疗') ||
                        name.includes('居住') || name.includes('其他')) {
                        color = '#34D399';  // 草绿色（支出）
                    } else if (name.includes('结余') || name.includes('沉淀') || name.includes('Savings')) {
                        color = '#059669';  // 深绿色（结余）
                    }

                    return {
                        name: node.name,
                        itemStyle: { color },
                    };
                }),
                links: data.links.map((link) => ({
                    source: link.source,
                    target: link.target,
                    value: link.value,
                })),
            },
        ],
    };

    return (
        <div>
            <ChartTitle>全景流向</ChartTitle>
            <ChartContainer>
                <ReactECharts
                    option={sankeyOption}
                    style={{ height: '350px' }}
                    opts={{ renderer: 'svg' }}
                />
            </ChartContainer>
        </div>
    );
};
