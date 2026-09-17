/* Preserve the submitted APLUS P6 Prelim session for printing. */
(function(){
'use strict';
const SESSION='APLUS_P6_PRELIM_SESSION_V1';
const COMPLETED='APLUS_P6_PRELIM_COMPLETED_V1';
try{
 const originalRemove=Storage.prototype.removeItem;
 Storage.prototype.removeItem=function(key){
   if(key===SESSION){
     try{const value=this.getItem(key);if(value)this.setItem(COMPLETED,value);}catch(e){}
   }
   return originalRemove.call(this,key);
 };
}catch(e){}
})();
