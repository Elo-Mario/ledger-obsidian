import { LedgerModifier } from './file-interface';
import LedgerPlugin from './main';
import { EnhancedTransaction } from './parser';
import {
    formatTransaction,
    hasUnreconciledLines,
    markAsReconciled,
} from './transaction-utils';
import { ReconcileTransactions } from './ui/ReconcileTransactions';
import { Modal, Notice, TFile } from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';

export class ReconcileModal extends Modal {
    private readonly plugin: LedgerPlugin;

    constructor(plugin: LedgerPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    public onOpen = async (): Promise<void> => {
        // 检查txCache是否已加载
        if (!this.plugin.txCache || !this.plugin.txCache.transactions) {
            new Notice('账本数据未加载，正在重新加载...');
            try {
                // 尝试重新加载
                await (this.plugin as any).updateTransactionCache();

                // 再次检查
                if (!this.plugin.txCache || !this.plugin.txCache.transactions) {
                    new Notice('无法加载账本数据，请检查账本文件路径设置');
                    this.close();
                    return;
                }
            } catch (error) {
                console.error('加载账本失败:', error);
                new Notice('加载账本失败，请检查控制台');
                this.close();
                return;
            }
        }

        const unreconciledTxs = this.getUnreconciledTransactions();

        ReactDOM.render(
            React.createElement(ReconcileTransactions, {
                transactions: unreconciledTxs,
                currencySymbol: this.plugin.settings.currencySymbol,
                onReconcile: this.handleReconcile,
                onClose: () => this.close(),
            }),
            this.contentEl,
        );
    };

    /**
     * getUnreconciledTransactions filters all transactions to find those
     * that have at least one unreconciled expense line.
     */
    private getUnreconciledTransactions = (): EnhancedTransaction[] => {
        return this.plugin.txCache.transactions.filter((tx) =>
            hasUnreconciledLines(tx),
        );
    };

    /**
     * handleReconcile processes the selected transactions and marks them as reconciled.
     * It modifies the ledger file by updating each transaction with the '*' reconcile mark.
     */
    private handleReconcile = async (
        selectedTxs: EnhancedTransaction[],
    ): Promise<void> => {
        if (selectedTxs.length === 0) {
            return;
        }

        try {
            const abstractFile = this.plugin.app.vault.getAbstractFileByPath(
                this.plugin.settings.ledgerFile,
            );

            if (!abstractFile || !(abstractFile instanceof TFile)) {
                new Notice('账本文件未找到');
                return;
            }

            const ledgerFile = abstractFile as TFile;
            const modifier = new LedgerModifier(this.plugin, ledgerFile);

            // Read the file once
            const fileContents = await this.plugin.app.vault.cachedRead(ledgerFile);
            let modifiedContent = fileContents;

            // Sort transactions from last to first to avoid line number changes
            const sortedTxs = [...selectedTxs].sort(
                (a, b) => b.block.firstLine - a.block.firstLine,
            );

            // Process each transaction
            for (const tx of sortedTxs) {
                const reconciledTx = markAsReconciled(tx);
                const serialized = formatTransaction(
                    reconciledTx,
                    this.plugin.settings.currencySymbol,
                );

                const lines = modifiedContent.split('\n');
                const newLines =
                    lines.slice(0, tx.block.firstLine).join('\n') +
                    serialized +
                    '\n' +
                    lines.slice(tx.block.lastLine + 1).join('\n');
                modifiedContent = newLines;
            }

            // Write back to file once
            await this.plugin.app.vault.modify(ledgerFile, modifiedContent);

            // Refresh the transaction cache
            await (this.plugin as any).updateTransactionCache();

            // Show success message
            new Notice(
                `对账完成，共 ${selectedTxs.length} 笔交易`,
            );

            this.close();
        } catch (error) {
            console.error('Reconciliation failed:', error);
            new Notice('对账失败，请查看控制台');
        }
    };

    public onClose = (): void => {
        ReactDOM.unmountComponentAtNode(this.contentEl);
        this.contentEl.empty();
    };
}
