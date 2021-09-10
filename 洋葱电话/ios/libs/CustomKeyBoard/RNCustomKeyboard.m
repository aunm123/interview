
#import "RNCustomKeyboard.h"
#import <React/RCTBridge+Private.h>
#import <React/RCTUIManager.h>
#import <React/RCTMultilineTextInputView.h>
#import <objc/runtime.h>

@implementation RNCustomKeyboard 
{
  bool hasListeners;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"UIInputViewTouchEvent"];
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

// 在添加第一个监听函数时触发
-(void)startObserving {
  hasListeners = YES;
}

-(void)stopObserving {
  hasListeners = NO;
}

-(void)tapView:(UITapGestureRecognizer *)sender{
    if (hasListeners) {
      [self sendEventWithName:@"UIInputViewTouchEvent" body:@{}];
      [self.singleTap removeTarget:self action:@selector(tapView:)];
      self.singleTap = NULL;
    }
}


#pragma mark - UIGestureRecognizerDelegate
 
- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldReceiveTouch:(UITouch *)touch
{
   return YES;
}

RCT_EXPORT_MODULE(CustomKeyboard)

RCT_EXPORT_METHOD(install:(nonnull NSNumber *)reactTag withType:(nonnull NSString *)keyboardType height:(nonnull NSNumber*)height ){
  
  RCTBridge* bridge = [self.bridge valueForKey:@"parentBridge"];
  if(bridge == nil)
  {
      return;
  }
  
  UIView* inputField = [self.bridge.uiManager viewForReactTag:reactTag];
  RCTRootView* inputView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"CustomKeyboard" initialProperties:
                     @{
                       @"tag": reactTag,
                       @"type": keyboardType
                     }];

  [inputView setFrame:CGRectMake(0, 0, 320, [height floatValue])];
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)inputField;

//  _backedTextInputView
  UITextView *view = (UITextView*)baseview.backedTextInputView;
  
  __weak typeof(self) weakSelf = self;
  dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC));
  dispatch_after(delayTime, dispatch_get_main_queue(), ^{
      
    UITapGestureRecognizer *singleTap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(tapView:)];
    singleTap.delegate = self;
    singleTap.numberOfTapsRequired = 1;
    singleTap.numberOfTouchesRequired = 1;
    [view addGestureRecognizer:singleTap];
    weakSelf.singleTap = singleTap;
  });
  
  
  
  view.inputView = inputView;

  [view reloadInputViews];
}

RCT_EXPORT_METHOD(uninstall:(nonnull NSNumber *)reactTag)
{
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;

  view.inputView = nil;
  [view reloadInputViews];
}

RCT_EXPORT_METHOD(insertText:(nonnull NSNumber *)reactTag withText:(NSString*)text) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;

  [view replaceRange:view.selectedTextRange withText:text];
}

RCT_EXPORT_METHOD(backSpace:(nonnull NSNumber *)reactTag deleteNum:(nonnull NSNumber *)deleteNum) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;

  UITextRange* range = view.selectedTextRange;
  if ([view comparePosition:range.start toPosition:range.end] == 0) {
    range = [view textRangeFromPosition:[view positionFromPosition:range.start offset:-1 * [deleteNum intValue]] toPosition:range.start];
  }
  [view replaceRange:range withText:@""];
}

RCT_EXPORT_METHOD(doDelete:(nonnull NSNumber *)reactTag deleteNum:(nonnull NSNumber *)deleteNum) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;

  UITextRange* range = view.selectedTextRange;
  if ([view comparePosition:range.start toPosition:range.end] == 0) {
    range = [view textRangeFromPosition:range.start toPosition:[view positionFromPosition: range.start offset: [deleteNum intValue]]];
  }
  [view replaceRange:range withText:@""];
}

RCT_EXPORT_METHOD(rangLastTextValue:(nonnull NSNumber *)reactTag CallBack:(RCTResponseSenderBlock)callback) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;
  
  UITextRange* range = view.selectedTextRange;
  NSString *result = [view textInRange:range];
  if ([view comparePosition:range.start toPosition:range.end] == 0) {
    // 只有光标，没有选择区域
    UITextPosition* beginning = view.beginningOfDocument;
    UITextPosition* selectionStart = range.start;
    
    const NSInteger length = [view offsetFromPosition:beginning toPosition:selectionStart];
    NSRange newRange = NSMakeRange(0, length);
  
    callback(@[[NSNull null], [view.text substringWithRange:newRange]]);
  } else{
    // 选择区域
     callback(@[[NSNull null], result]);
  }
  
}

RCT_EXPORT_METHOD(moveLeft:(nonnull NSNumber *)reactTag) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;

  UITextRange* range = view.selectedTextRange;
  UITextPosition* position = range.start;

  if ([view comparePosition:range.start toPosition:range.end] == 0) {
    position = [view positionFromPosition: position offset: -1];
  }

  view.selectedTextRange = [view textRangeFromPosition: position toPosition:position];
}

RCT_EXPORT_METHOD(moveRight:(nonnull NSNumber *)reactTag) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;

  UITextRange* range = view.selectedTextRange;
  UITextPosition* position = range.end;

  if ([view comparePosition:range.start toPosition:range.end] == 0) {
    position = [view positionFromPosition: position offset: 1];
  }

  view.selectedTextRange = [view textRangeFromPosition: position toPosition:position];
}

RCT_EXPORT_METHOD(switchSystemKeyboard:(nonnull NSNumber*) reactTag) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;
  
  view.inputView = nil;
  [view reloadInputViews];
  
}

RCT_EXPORT_METHOD(setSelectLast:(nonnull NSNumber*) reactTag) {
  RCTMultilineTextInputView *baseview = (RCTMultilineTextInputView*)[self.bridge.uiManager viewForReactTag:reactTag];
  UITextView *view = (UITextView*)baseview.backedTextInputView;
  
//  UITextPosition* position = view.endOfDocument;
//  UITextRange *range = [view textRangeFromPosition:position toPosition:position];
//  [view setSelectedTextRange:range];
  
//  NSRange range = view.selectedRange;
//  UITextRange* ranges = view.selectedTextRange;
  
  [view setSelectedRange:NSMakeRange(view.text.length, 0)];
  
}

@end
  
