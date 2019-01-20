# Version Log

## 1.0.5

### NEW

* NG : 新的錯誤乘載模式

## 1.0.6

### FIX

* Param Length: 修復動態配置參數如果有預設值導致錯誤，Assembly會偵測是否有預設值去parse參數

### NEW

* Un Packing: 移除宣告的包裝
* Param Length: 因應ES6語法可以手動置入參數長度來提升效能

### MODIFY

* Packing : 連續宣告將反覆包裝下去

## 1.0.7

### NEW

* Param Length: 直觀的錯誤處理

## 1.0.8

### NEW

* Group Alias: 群組別名，可以顯示在追蹤上
* Assembly Bridge: 在呼叫群組前宣告的函數
* Merger And Coop: Alone群組的內部運用

### MODIFY

* Error: 某些錯誤有了專屬的錯誤訊息
* Error : exception的追蹤能看到函數名稱