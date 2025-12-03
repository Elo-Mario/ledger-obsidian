import React from 'react';
import ReactECharts from 'echarts-for-react';
import styled from 'styled-components';
import { TreemapNode } from '../financial-report-utils';
import { getChartColors, observeThemeChange } from '../theme-utils';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div`
  width: 100%;
`;

const ChartContainer = styled.div`
  width: 100%;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 8px;
`;

const ChartTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--text-normal);
`;

interface DualTreemapProps {
    assetsData: TreemapNode[];
    liabilitiesData: TreemapNode[];
    currencySymbol: string;
}

export const DualTreemap: React.FC<DualTreemapProps> = ({
    assetsData,
    liabilitiesData,
    currencySymbol,
}) => {
    const [refreshKey, setRefreshKey] = React.useState(0);

    // Listen for theme changes
    React.useEffect(() => {
        const cleanup = observeThemeChange(() => {
            setRefreshKey(prev => prev + 1); // Force re-render
        });
        return cleanup;
    }, []);

    const formatCurrency = (value: number) => {
        return `${currencySymbol}${value.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getOption = (
        data: TreemapNode[],
        title: string,
        colors: string[]
    ) => ({
        backgroundColor: 'transparent',
        tooltip: {
            formatter: (info: any) => {
                const value = info.value;
                const treePathInfo = info.treePathInfo;
                const treePath = [];

                for (let i = 1; i < treePathInfo.length; i++) {
                    treePath.push(treePathInfo[i].name);
                }

                return [
                    `<div class="tooltip-title">${treePath.join(' > ')}</div>`,
                    `金额: ${formatCurrency(value)}`,
                ].join('');
            },
        },
        series: [
            {
                name: title,
                type: 'treemap',
                visibleMin: 300,
                label: {
                    show: true,
                    formatter: '{b}',
                    fontSize: 12,
                    color: getChartColors().text,  // Dynamic color
                },
                itemStyle: {
                    borderWidth: 0,
                },
                breadcrumb: {
                    show: false,
                },
                data: data,
                color: colors,
                roam: false,
                nodeClick: false,
            },
        ],
    });

    // Green palette for Assets
    const assetColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

    // Red palette for Liabilities
    const liabilityColors = ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'];

    return (
        <Container>
            <ChartSection>
                <ChartTitle>资产结构</ChartTitle>
                <ChartContainer>
                    <ReactECharts
                        option={getOption(assetsData, '资产', assetColors)}
                        style={{ height: '350px' }}
                        opts={{ renderer: 'svg' }}
                    />
                </ChartContainer>
            </ChartSection>
            <ChartSection>
                <ChartTitle>负债分布</ChartTitle>
                <ChartContainer>
                    <ReactECharts
                        option={getOption(liabilitiesData, '负债', liabilityColors)}
                        style={{ height: '350px' }}
                        opts={{ renderer: 'svg' }}
                    />
                </ChartContainer>
            </ChartSection>
        </Container>
    );
};
