import { TransactionCache } from './parser';
import { ISettings } from './settings';
import { Moment } from 'moment';
import {
    makeDailyAccountBalanceChangeMap,
    makeDailyBalanceMap,
} from './balance-utils';

/**
 * KPI data for a given month
 */
export interface KPIData {
    balance: number;
    income: number;
    expense: number;
    totalIncome: number;
    totalExpense: number;
    savingsRate: number; // Percentage (0-100)
}

/**
 * Sankey diagram node
 */
export interface SankeyNode {
    id: string;
    name: string;
}

/**
 * Sankey diagram link
 */
export interface SankeyLink {
    source: string;
    target: string;
    value: number;
}

/**
 * Sankey diagram data structure
 */
export interface SankeyData {
    nodes: SankeyNode[];
    links: SankeyLink[];
}

/**
 * Treemap node (hierarchical structure)
 */
export interface TreemapNode {
    name: string;
    value?: number;
    children?: TreemapNode[];
}

/**
 * Daily trend data point
 */
export interface DailyDataPoint {
    date: string;
    amount: number;
}

/**
 * Trend data with daily income and expense
 */
export interface TrendData {
    dailyIncome: DailyDataPoint[];
    dailyExpense: DailyDataPoint[];
}

/**
 * DashboardDataService provides data processing methods for the financial dashboard.
 */
export class DashboardDataService {
    constructor(
        private txCache: TransactionCache,
        private settings: ISettings,
    ) { }

    /**
     * Calculate KPI metrics for the specified month
     */
    public calculateKPIs(month: Moment): KPIData {
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');

        let totalIncome = 0;
        let totalExpense = 0;

        const monthTransactions = this.txCache.transactions.filter((tx) => {
            const txDate = window.moment(tx.value.date);
            return txDate.isBetween(startOfMonth, endOfMonth, 'day', '[]');
        });

        monthTransactions.forEach((tx) => {
            tx.value.expenselines.forEach((line) => {
                if (!('account' in line)) return;

                const account = line.dealiasedAccount;

                if (account.includes('Income') || account.includes('收入')) {
                    totalIncome += Math.abs(line.amount);
                } else if (account.includes('Expense') || account.includes('支出')) {
                    totalExpense += line.amount;
                }
            });
        });

        const balance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            balance,
            income: totalIncome,
            expense: totalExpense,
            totalIncome,
            totalExpense,
            savingsRate,
        };
    }

    /**
     * Generate Sankey diagram data showing flow from income to expenses and balance
     */
    public generateSankeyData(month: Moment): SankeyData {
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');

        const nodes: SankeyNode[] = [];
        const links: SankeyLink[] = [];

        let totalIncome = 0;
        const expenseCategories = new Map<string, number>();

        const monthTransactions = this.txCache.transactions.filter((tx) => {
            const txDate = window.moment(tx.value.date);
            return txDate.isBetween(startOfMonth, endOfMonth, 'day', '[]');
        });

        monthTransactions.forEach((tx) => {
            tx.value.expenselines.forEach((line) => {
                if (!('account' in line)) return;

                const account = line.dealiasedAccount;

                if (account.includes('Income') || account.includes('收入')) {
                    totalIncome += Math.abs(line.amount);
                } else if (account.includes('Expense') || account.includes('支出')) {
                    // Extract second-level category (e.g., "支出:餐饮:外食" -> "餐饮")
                    const parts = account.split(':');
                    const category = parts.length > 1 ? parts[1] : parts[0];

                    const current = expenseCategories.get(category) || 0;
                    expenseCategories.set(category, current + line.amount);
                }
            });
        });

        // Create Income node
        nodes.push({ id: 'Income', name: 'Income' });

        // Create expense category nodes and links
        let totalExpense = 0;
        expenseCategories.forEach((amount, category) => {
            nodes.push({ id: category, name: category });
            links.push({
                source: 'Income',
                target: category,
                value: amount,
            });
            totalExpense += amount;
        });

        // Create Balance/Savings node if there's a positive balance
        const balance = totalIncome - totalExpense;
        if (balance > 0) {
            nodes.push({ id: 'Balance', name: 'Balance' });
            links.push({
                source: 'Income',
                target: 'Balance',
                value: balance,
            });
        }

        return { nodes, links };
    }

    /**
     * Generate treemap data for asset or liability structure
     */
    public generateTreemapData(
        month: Moment,
        type: 'asset' | 'liability' = 'asset',
    ): TreemapNode {
        const endOfMonth = month.clone().endOf('month');

        const dailyBalanceChangeMap = makeDailyAccountBalanceChangeMap(
            this.txCache.transactions,
        );
        const dailyBalanceMap = makeDailyBalanceMap(
            this.txCache.accounts,
            dailyBalanceChangeMap,
            this.txCache.firstDate,
            endOfMonth,
        );

        const endDateStr = endOfMonth.format('YYYY-MM-DD');
        const balanceData = dailyBalanceMap.get(endDateStr);

        const rootName = type === 'asset' ? 'Assets' : 'Liabilities';
        const root: TreemapNode = {
            name: rootName,
            children: [],
        };

        if (!balanceData) {
            return root;
        }

        const nodeMap = new Map<string, TreemapNode>();
        nodeMap.set(rootName, root);

        const accounts =
            type === 'asset'
                ? this.txCache.assetAccounts
                : this.txCache.liabilityAccounts;

        accounts.forEach((account) => {
            const balance = balanceData.get(account) || 0;

            if (balance <= 0) return;

            // Extract account hierarchy
            const parts = account.split(':');

            let currentPath = rootName;
            let currentNode = root;

            parts.forEach((part, index) => {
                const parentPath = currentPath;
                currentPath = `${currentPath}:${part}`;

                let childNode = nodeMap.get(currentPath);

                if (!childNode) {
                    childNode = {
                        name: part,
                        children: [],
                    };

                    const parentNode = nodeMap.get(parentPath);
                    if (parentNode && parentNode.children) {
                        parentNode.children.push(childNode);
                    }

                    nodeMap.set(currentPath, childNode);
                }

                if (index === parts.length - 1) {
                    childNode.value = balance;
                    delete childNode.children;
                }

                currentNode = childNode;
            });
        });

        return root;
    }

    /**
     * Generate daily trend data for income and expense
     */
    public generateTrendData(month: Moment): TrendData {
        const startOfMonth = month.clone().startOf('month');
        const endOfMonth = month.clone().endOf('month');

        const dailyBalanceChangeMap = makeDailyAccountBalanceChangeMap(
            this.txCache.transactions,
        );

        const dailyIncome: DailyDataPoint[] = [];
        const dailyExpense: DailyDataPoint[] = [];

        const currentDate = startOfMonth.clone();
        while (currentDate.isSameOrBefore(endOfMonth)) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const dayData = dailyBalanceChangeMap.get(dateStr);

            let dayIncome = 0;
            let dayExpense = 0;

            if (dayData) {
                dayData.forEach((amount, account) => {
                    if (account.includes('Income') || account.includes('收入')) {
                        dayIncome += Math.abs(amount);
                    } else if (account.includes('Expense') || account.includes('支出')) {
                        dayExpense += amount;
                    }
                });
            }

            dailyIncome.push({ date: dateStr, amount: dayIncome });
            dailyExpense.push({ date: dateStr, amount: dayExpense });

            currentDate.add(1, 'day');
        }

        return { dailyIncome, dailyExpense };
    }
}
