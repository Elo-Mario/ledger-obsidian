import type { EnhancedTransaction, TransactionCache } from './parser';
import { filterByEndDate, filterByStartDate, getTotalAsNum } from './transaction-utils';
import { Moment } from 'moment';

/**
 * 计算指定月份的财务KPI指标
 */
export interface MonthlyKPI {
    balance: number;      // 本月结余
    income: number;       // 本月收入
    expense: number;      // 本月支出
    savingsRate: number;  // 储蓄率 (0-1)
}

export function calculateMonthlyKPI(
    txCache: TransactionCache,
    month: Moment,
): MonthlyKPI {
    const startOfMonth = month.clone().startOf('month');
    const endOfMonth = month.clone().endOf('month');

    const monthTransactions = txCache.transactions.filter((tx) => {
        const txDate = window.moment(tx.value.date, ['YYYY-MM-DD', 'YYYY/MM/DD']);
        return txDate.isSameOrAfter(startOfMonth) && txDate.isSameOrBefore(endOfMonth);
    });

    let income = 0;
    let expense = 0;

    monthTransactions.forEach((tx) => {
        tx.value.expenselines.forEach((line) => {
            if (!('account' in line)) return;

            const account = line.dealiasedAccount;

            // 收入账户
            if (account.includes('Income') || account.includes('收入')) {
                income += Math.abs(line.amount);
            }
            // 支出账户
            else if (account.includes('Expense') || account.includes('支出')) {
                expense += Math.abs(line.amount);
            }
        });
    });

    const balance = income - expense;
    const savingsRate = income > 0 ? balance / income : 0;

    return {
        balance,
        income,
        expense,
        savingsRate,
    };
}

/**
 * 计算多个月份的趋势数据
 */
export interface TrendData {
    months: string[];
    income: number[];
    expense: number[];
    netBalance: number[];
}

export function calculateTrendData(
    txCache: TransactionCache,
    monthsCount: number = 6,
): TrendData {
    const months: string[] = [];
    const income: number[] = [];
    const expense: number[] = [];
    const netBalance: number[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
        const month = window.moment().subtract(i, 'months');
        const kpi = calculateMonthlyKPI(txCache, month);

        months.push(month.format('M月'));
        income.push(kpi.income);
        expense.push(kpi.expense);
        netBalance.push(kpi.balance);
    }

    return { months, income, expense, netBalance };
}

/**
 * 计算资产结构数据（用于Treemap）
 */
export interface TreemapNode {
    name: string;
    value: number;
    itemStyle?: { color: string };
    children?: TreemapNode[];
}

export function calculateAssetStructure(
    txCache: TransactionCache,
): TreemapNode[] {
    // 计算各账户的当前余额
    const accountBalances = new Map<string, number>();

    txCache.transactions.forEach((tx) => {
        tx.value.expenselines.forEach((line) => {
            if (!('account' in line)) return;

            const account = line.dealiasedAccount;
            const current = accountBalances.get(account) || 0;
            accountBalances.set(account, current + line.amount);
        });
    });

    // 按账户类型分组
    const assets: TreemapNode[] = [];
    const liabilities: TreemapNode[] = [];

    accountBalances.forEach((balance, account) => {
        if (balance === 0) return;

        const parts = account.split(':');
        const category = parts[0];
        const subcategory = parts.slice(1).join(':') || category;

        const node: TreemapNode = {
            name: subcategory,
            value: Math.abs(balance),
        };

        if (category.includes('Asset') || category.includes('资产')) {
            assets.push(node);
        } else if (category.includes('Liab') || category.includes('负债')) {
            liabilities.push(node);
        }
    });

    const result: TreemapNode[] = [];

    if (assets.length > 0) {
        result.push({
            name: '资产',
            value: assets.reduce((sum, a) => sum + a.value, 0),
            itemStyle: { color: '#3b82f6' },
            children: assets,
        });
    }

    if (liabilities.length > 0) {
        result.push({
            name: '负债',
            value: liabilities.reduce((sum, l) => sum + l.value, 0),
            itemStyle: { color: '#ef4444' },
            children: liabilities,
        });
    }

    return result;
}

/**
 * 生成Sankey图数据（收入->支出流向）
 */
export interface SankeyData {
    nodes: Array<{ name: string }>;
    links: Array<{ source: string; target: string; value: number }>;
}

export function calculateSankeyData(
    txCache: TransactionCache,
    month: Moment,
): SankeyData {
    const startOfMonth = month.clone().startOf('month');
    const endOfMonth = month.clone().endOf('month');

    const monthTransactions = txCache.transactions.filter((tx) => {
        const txDate = window.moment(tx.value.date, ['YYYY-MM-DD', 'YYYY/MM/DD']);
        return txDate.isSameOrAfter(startOfMonth) && txDate.isSameOrBefore(endOfMonth);
    });

    // 收集收入和支出流向
    const incomeBySource = new Map<string, number>();
    const expenseByCategory = new Map<string, number>();

    monthTransactions.forEach((tx) => {
        let hasIncome = false;
        let hasExpense = false;
        const txIncomeSources: string[] = [];
        const txExpenseCategories: string[] = [];

        tx.value.expenselines.forEach((line) => {
            if (!('account' in line)) return;

            const account = line.dealiasedAccount;
            // 限制到二级账户
            const parts = account.split(':');
            const secondLevel = parts.slice(0, 2).join(':'); // 只取前两级

            if (account.includes('Income') || account.includes('收入')) {
                hasIncome = true;
                txIncomeSources.push(secondLevel);
                const current = incomeBySource.get(secondLevel) || 0;
                incomeBySource.set(secondLevel, current + Math.abs(line.amount));
            } else if (account.includes('Expense') || account.includes('支出')) {
                hasExpense = true;
                txExpenseCategories.push(secondLevel);
                const current = expenseByCategory.get(secondLevel) || 0;
                expenseByCategory.set(secondLevel, current + Math.abs(line.amount));
            }
        });
    });

    // 构建节点和链接
    const nodes: Array<{ name: string }> = [];
    const links: Array<{ source: string; target: string; value: number }> = [];

    // 添加收入源节点
    incomeBySource.forEach((value, source) => {
        nodes.push({ name: source });
    });

    // 添加支出类别节点
    expenseByCategory.forEach((value, category) => {
        nodes.push({ name: category });
    });

    // 简化：假设收入按比例流向各支出
    const totalIncome = Array.from(incomeBySource.values()).reduce((sum, v) => sum + v, 0);
    const totalExpense = Array.from(expenseByCategory.values()).reduce((sum, v) => sum + v, 0);

    if (totalIncome > 0 && totalExpense > 0) {
        incomeBySource.forEach((incomeValue, source) => {
            expenseByCategory.forEach((expenseValue, category) => {
                const flowValue = (incomeValue / totalIncome) * expenseValue;
                if (flowValue > 0) {
                    links.push({
                        source,
                        target: category,
                        value: flowValue,
                    });
                }
            });
        });
    }

    return { nodes, links };
}

/**
 * 获取月度交易明细
 */
export interface Transaction {
    date: string;
    project: string;
    income: number;
    expense: number;
    balance: number;
    account: string;
    note: string;
}

export function getMonthlyTransactions(
    txCache: TransactionCache,
    month: Moment,
): Transaction[] {
    const startOfMonth = month.clone().startOf('month');
    const endOfMonth = month.clone().endOf('month');

    const monthTransactions = txCache.transactions.filter((tx) => {
        const txDate = window.moment(tx.value.date, ['YYYY-MM-DD', 'YYYY/MM/DD']);
        return txDate.isSameOrAfter(startOfMonth) && txDate.isSameOrBefore(endOfMonth);
    });

    let runningBalance = 0;
    const transactions: Transaction[] = [];

    monthTransactions.forEach((tx) => {
        const total = getTotalAsNum(tx);
        const isIncome = total < 0; // 负值表示收入（资产增加）

        const mainAccount = tx.value.expenselines.find(line => 'account' in line && line.amount !== 0);

        runningBalance += Math.abs(total);

        transactions.push({
            date: tx.value.date,
            project: tx.value.payee,
            income: isIncome ? Math.abs(total) : 0,
            expense: !isIncome ? Math.abs(total) : 0,
            balance: runningBalance,
            account: mainAccount && 'account' in mainAccount ? mainAccount.dealiasedAccount : '',
            note: tx.value.comment || '',
        });
    });

    return transactions;
}

/**
 * 计算按日趋势数据（用于当月每日的收支趋势）
 */
export interface DailyTrendData {
    dates: string[];       // 日期数组 (1-31)
    income: number[];      // 每日收入
    expense: number[];     // 每日支出
    netBalance: number[];  // 每日净结余
}

export function calculateDailyTrendData(
    txCache: TransactionCache,
    month: Moment,
): DailyTrendData {
    const startOfMonth = month.clone().startOf('month');
    const endOfMonth = month.clone().endOf('month');
    const daysInMonth = month.daysInMonth();

    // 初始化每日数据
    const dailyIncome = new Map<number, number>();
    const dailyExpense = new Map<number, number>();

    // 累计每日的收入和支出
    txCache.transactions.forEach((tx) => {
        const txDate = window.moment(tx.value.date, ['YYYY-MM-DD', 'YYYY/MM/DD']);
        if (!txDate.isBetween(startOfMonth, endOfMonth, null, '[]')) return;

        const day = txDate.date();
        let dayIncome = 0;
        let dayExpense = 0;

        tx.value.expenselines.forEach((line) => {
            if (!('account' in line)) return;
            const account = line.dealiasedAccount;

            if (account.includes('Income') || account.includes('收入')) {
                dayIncome += Math.abs(line.amount);
            } else if (account.includes('Expense') || account.includes('支出')) {
                dayExpense += Math.abs(line.amount);
            }
        });

        dailyIncome.set(day, (dailyIncome.get(day) || 0) + dayIncome);
        dailyExpense.set(day, (dailyExpense.get(day) || 0) + dayExpense);
    });

    // 构建输出数组（只包含有交易的日期）
    const dates: string[] = [];
    const income: number[] = [];
    const expense: number[] = [];
    const netBalance: number[] = [];

    let cumulativeBalance = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayInc = dailyIncome.get(day) || 0;
        const dayExp = dailyExpense.get(day) || 0;

        if (dayInc === 0 && dayExp === 0) continue; // 跳过无交易的日期

        dates.push(day.toString());
        income.push(dayInc);
        expense.push(dayExp);
        cumulativeBalance += (dayInc - dayExp);
        netBalance.push(cumulativeBalance);
    }

    return { dates, income, expense, netBalance };
}

/**
 * 计算资产+收入结构（用于Treemap）
 */
export function calculateAssetAndIncomeStructure(
    txCache: TransactionCache,
): TreemapNode[] {
    const accountBalances = new Map<string, number>();

    txCache.transactions.forEach((tx) => {
        tx.value.expenselines.forEach((line) => {
            if (!('account' in line)) return;
            const account = line.dealiasedAccount;
            const current = accountBalances.get(account) || 0;
            accountBalances.set(account, current + line.amount);
        });
    });

    // 按二级账户聚合（扁平结构，不嵌套）
    const secondLevelBalances = new Map<string, number>();

    accountBalances.forEach((balance, account) => {
        if (balance === 0) return;
        const parts = account.split(':');
        const category = parts[0];

        // 只包含资产和收入
        if (category.includes('Asset') || category.includes('资产') ||
            category.includes('Income') || category.includes('收入')) {
            // 取二级账户名称（例如："资产:银行" 取 "银行"）
            const secondLevelName = parts[1] || parts[0];
            const current = secondLevelBalances.get(secondLevelName) || 0;
            secondLevelBalances.set(secondLevelName, current + balance);
        }
    });

    // 构建扁平Treemap数据（不嵌套，每个都是顶级节点）
    const result: TreemapNode[] = [];
    secondLevelBalances.forEach((balance, name) => {
        if (balance === 0) return;
        result.push({
            name: name,
            value: Math.abs(balance),
            itemStyle: { color: balance > 0 ? '#3b82f6' : '#10b981' }
        });
    });

    return result;
}

/**
 * 计算负债结构（用于Treemap）
 */
export function calculateLiabilitiesStructure(
    txCache: TransactionCache,
): TreemapNode[] {
    const accountBalances = new Map<string, number>();

    txCache.transactions.forEach((tx) => {
        tx.value.expenselines.forEach((line) => {
            if (!('account' in line)) return;
            const account = line.dealiasedAccount;
            const current = accountBalances.get(account) || 0;
            accountBalances.set(account, current + line.amount);
        });
    });

    // 按二级账户聚合（扁平结构）
    const secondLevelBalances = new Map<string, number>();

    accountBalances.forEach((balance, account) => {
        if (balance === 0) return;
        const parts = account.split(':');
        const category = parts[0];

        // 只包含负债
        if (category.includes('Liab') || category.includes('负债')) {
            // 取二级账户名称
            const secondLevelName = parts[1] || parts[0];
            const current = secondLevelBalances.get(secondLevelName) || 0;
            secondLevelBalances.set(secondLevelName, current + Math.abs(balance));
        }
    });

    // 构建扁平Treemap数据
    const result: TreemapNode[] = [];
    secondLevelBalances.forEach((balance, name) => {
        if (balance === 0) return;
        result.push({
            name: name,
            value: balance,
            itemStyle: { color: '#ef4444' }
        });
    });

    return result;
}

/**
 * 获取带来源/目标账户的交易明细
 */
export interface TransactionRow {
    date: string;          // 日期
    payee: string;         // 收款人
    amount: number;        // 金额
    sourceAccount: string; // 来源账户
    targetAccount: string; // 目标账户
}

export function getTransactionsWithAccounts(
    txCache: TransactionCache,
    month: Moment,
): TransactionRow[] {
    const startOfMonth = month.clone().startOf('month');
    const endOfMonth = month.clone().endOf('month');

    const monthTransactions = txCache.transactions.filter((tx) => {
        const txDate = window.moment(tx.value.date, ['YYYY-MM-DD', 'YYYY/MM/DD']);
        return txDate.isSameOrAfter(startOfMonth) && txDate.isSameOrBefore(endOfMonth);
    });

    const transactions: TransactionRow[] = [];

    monthTransactions.forEach((tx) => {
        // 找出正负金额的账户
        const positiveLines = tx.value.expenselines.filter(line => 'account' in line && line.amount > 0);
        const negativeLines = tx.value.expenselines.filter(line => 'account' in line && line.amount < 0);

        const sourceAccount = negativeLines.length > 0 && 'account' in negativeLines[0]
            ? negativeLines[0].dealiasedAccount
            : '';
        const targetAccount = positiveLines.length > 0 && 'account' in positiveLines[0]
            ? positiveLines[0].dealiasedAccount
            : '';

        const amount = positiveLines.length > 0 && 'amount' in positiveLines[0]
            ? Math.abs(positiveLines[0].amount)
            : 0;

        transactions.push({
            date: window.moment(tx.value.date, ['YYYY-MM-DD', 'YYYY/MM/DD']).format('MM-DD'),
            payee: tx.value.payee,
            amount,
            sourceAccount,
            targetAccount,
        });
    });

    return transactions;
}
