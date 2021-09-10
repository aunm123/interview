//
//  CallKitCallModule.m
//  voiceCall_rn
//
//  Created by tim on 9/21/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CallKitCallModule.h"
#import <React/RCTLog.h>

@import AVFoundation;
@import PushKit;
@import CallKit;
@import TwilioVoice;

@interface CallKitCallModule () <PKPushRegistryDelegate, TVONotificationDelegate, TVOCallDelegate, CXProviderDelegate>

@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, strong) NSString *current_accessToken;
@property (nonatomic, strong) NSDictionary *callphone_params;
@property (nonatomic, strong) NSString *deviceTokenString;

@property (nonatomic, strong) void(^incomingPushCompletionCallback)(void);
@property (nonatomic, strong) TVOCallInvite *callInvite;
@property (nonatomic, strong) TVOCall *call;
@property (nonatomic, strong) void(^callKitCompletionCallback)(BOOL);
@property (nonatomic, strong) TVODefaultAudioDevice *audioDevice;

@property (nonatomic, strong) CXProvider *callKitProvider;
@property (nonatomic, strong) CXCallController *callKitCallController;
@property (nonatomic, assign) BOOL userInitiatedDisconnect;

@property (nonatomic, assign) BOOL mute;
@property (nonatomic, assign) BOOL amplification;

@end

@implementation CallKitCallModule
{
  bool hasListeners;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(registeNotificition:(NSString *)accessToken)
{
  RCTLogInfo(@"register Notificition finish");
  
  self.current_accessToken = accessToken;
  
  self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
  self.voipRegistry.delegate = self;
  self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
  
  [self configureCallKit];
  
  self.audioDevice = [TVODefaultAudioDevice audioDevice];
  TwilioVoice.audioDevice = self.audioDevice;
  
  self.mute = NO;
  self.amplification = NO;
}

// 在添加第一个监听函数时触发
-(void)startObserving {
  hasListeners = YES;
}

-(void)stopObserving {
  hasListeners = NO;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"EvemtVoiceCallComingStart",
           @"EventCallComingInApp",
           @"EventCallComingOutApp",
           @"EventCallComingStart",
           @"EventCallDidStartRinging",
           @"EventCallDidConnect",
           @"EventCallReconnecting",
           @"EventCallReconnected",
           @"EventCallDidFailed",
           @"EventCallDisconnected",
           @"EventNoPermission",
           @"EvemtEndCallAction",
           @"EventErrorMessage",
           @"EventTokenGet",
           @"EventCallReject",
           ];
}

- (void)configureCallKit {
  CXProviderConfiguration *configuration = [[CXProviderConfiguration alloc] initWithLocalizedName:@"洋葱"];
  configuration.maximumCallGroups = 1;
  configuration.maximumCallsPerCallGroup = 1;
  UIImage *callkitIcon = [UIImage imageNamed:@"iconMask80"];
  configuration.iconTemplateImageData = UIImagePNGRepresentation(callkitIcon);
  
  _callKitProvider = [[CXProvider alloc] initWithConfiguration:configuration];
  [_callKitProvider setDelegate:self queue:nil];
  
  _callKitCallController = [[CXCallController alloc] init];
}

- (void)dealloc {
  if (self.callKitProvider) {
    [self.callKitProvider invalidate];
  }
}

RCT_EXPORT_METHOD(callPhone:(NSDictionary*)params name:(NSString*)name){
  
  if (self.call && self.call.state == TVOCallStateConnected) {
    self.userInitiatedDisconnect = YES;
    [self performEndCallActionWithUUID:self.call.uuid];
  } else {
    NSUUID *uuid = [NSUUID UUID];
    NSString *handle = name;
    
    [self checkRecordPermission:^(BOOL permissionGranted) {
      if (!permissionGranted) {
        if (self->hasListeners) {
          [self sendEventWithName:@"EventNoPermission" body:@{}];
        }
      } else {
        self.callphone_params = params;
        [self performStartCallActionWithUUID:uuid handle:handle];
      }
    }];
  }
}

RCT_EXPORT_METHOD(endCallPhone){
  self.audioDevice.enabled = YES;
  if (self.call) {
    self.userInitiatedDisconnect = YES;
    [self performEndCallActionWithUUID:self.call.uuid];
  }
  [self callDisconnected];
}

RCT_EXPORT_METHOD(setSwitch:(BOOL)value ){
  self.mute = value;
  self.call.muted  = value;
}

RCT_EXPORT_METHOD(setAudioRoute:(BOOL)value){
  self.amplification = value;
  [self toggleAudioRoute:value];
}

// 接受来电
RCT_EXPORT_METHOD(acceptCallWithUUID:(NSString*)UUID){
  
  [self checkRecordPermission:^(BOOL permissionGranted) {
    if (!permissionGranted) {
      if (self->hasListeners) {
        [self sendEventWithName:@"EventNoPermission" body:@{}];
      }
    } else {
      
      dispatch_async(dispatch_get_main_queue(), ^{
//         self.audioDevice.enabled = NO;
//         self.audioDevice.block();
         
         NSUUID *u = [[NSUUID alloc]initWithUUIDString:UUID];
         NSError *error = nil;
         if (![[AVAudioSession sharedInstance] setCategory:AVAudioSessionCategoryPlayAndRecord
                                                     error:&error]) {
           NSLog(@"Unable to reroute audio: %@", [error localizedDescription]);
         }
         [self performAnswerVoiceCallWithUUID:u completion:^(BOOL success) {
           if (success) {
             RCTLog(@"成功接听");
             
           } else {
             
           }
         }];
        
      });
    }
  }];
  
  
}
// 拒绝来电
RCT_EXPORT_METHOD(rejectCallWithUUID:(NSString*)UUID){
  if (self.callInvite) {
    [self.callInvite reject];
    if (self->hasListeners) {
      [self sendEventWithName:@"EventCallReject" body:@{@"sid": self.callInvite.callSid}];
    }
    self.callInvite = nil;
  } else if (self.call) {
    [self.call disconnect];
  }
  
  self.audioDevice.enabled = YES;
}

- (void)checkRecordPermission:(void(^)(BOOL permissionGranted))completion {
  dispatch_async(dispatch_get_main_queue(), ^{
    AVAudioSessionRecordPermission permissionStatus = [[AVAudioSession sharedInstance] recordPermission];
    switch (permissionStatus) {
        case AVAudioSessionRecordPermissionGranted:
        // Record permission already granted.
        completion(YES);
        break;
        case AVAudioSessionRecordPermissionDenied:
        // Record permission denied.
        completion(NO);
        break;
        case AVAudioSessionRecordPermissionUndetermined:
      {
        // Requesting record permission.
        // Optional: pop up app dialog to let the users know if they want to request.
        [[AVAudioSession sharedInstance] requestRecordPermission:^(BOOL granted) {
          completion(granted);
        }];
        break;
      }
      default:
        completion(NO);
        break;
    }
  });
}


#pragma mark - PKPushRegistryDelegate

//- (void)delayRegiste{
//
//  NSString *accessToken = self.current_accessToken;
//
//  if ([accessToken isEqualToString:nil]){
//    [self performSelector:@selector(delayRegiste) withObject:nil afterDelay:1];
//  } else{
//
//
//  }
//
//}

// 注册deviceToken
- (void)pushRegistry:(nonnull PKPushRegistry *)registry didUpdatePushCredentials:(nonnull PKPushCredentials *)credentials forType:(nonnull PKPushType)type {
  
  RCTLogInfo(@"pushRegistry:didUpdatePushCredentials:forType:");
  
  if ([type isEqualToString:PKPushTypeVoIP]) {
    RCTLogInfo(@"PushCredentials: %@", credentials.token);
    
    NSData* deviceToken = credentials.token;
    const unsigned *tokenBytes = [deviceToken bytes];
    NSString *tkn = [NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
                            ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
                            ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
                            ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];
    
    self.deviceTokenString = tkn;
    
    NSString *accessToken = self.current_accessToken;
    
    if (self->hasListeners) {
      [self sendEventWithName:@"EventTokenGet" body:@{@"params": @{@"accessToken": accessToken, @"deviceToken": self.deviceTokenString}}];
    }
    
    [TwilioVoice registerWithAccessToken:accessToken deviceToken:self.deviceTokenString completion:^(NSError *error) {
      if (error) {
        RCTLogInfo(@"An error occurred while registering: %@", [error localizedDescription]);
        if (self->hasListeners) {
          [self sendEventWithName:@"EventErrorMessage" body:@{@"error": [NSString stringWithFormat:@"An error occurred while registering: %@", [error localizedDescription]]}];
        }
      } else {
        RCTLogInfo(@"Successfully registered for VoIP push notifications.");
      }
    }];
    
  }
}
// 取消注册deviceToken
- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type {
  RCTLogInfo(@"pushRegistry:didInvalidatePushTokenForType:");
  
  if ([type isEqualToString:PKPushTypeVoIP]) {
    NSString *accessToken = self.current_accessToken;
    
    [TwilioVoice unregisterWithAccessToken:accessToken deviceToken:self.deviceTokenString completion:^(NSError * _Nullable error) {
      if (error) {
        RCTLogInfo(@"An error occurred while unregistering: %@", [error localizedDescription]);
      }
      else {
        RCTLogInfo(@"Successfully unregistered for VoIP push notifications.");
      }
    }];
    self.deviceTokenString = nil;
  }
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type {
  RCTLogInfo(@"pushRegistry:didReceiveIncomingPushWithPayload:forType:");
  if ([type isEqualToString:PKPushTypeVoIP]) {
    if (![TwilioVoice handleNotification:payload.dictionaryPayload delegate:self]) {
      RCTLogInfo(@"This is not a valid Twilio Voice notification.");
      if (self->hasListeners) {
        [self sendEventWithName:@"EventErrorMessage" body:@{@"error": @"This is not a valid Twilio Voice notification.2"}];
      }
    }
  }
}

/**
 * This delegate method is available on iOS 11 and above. Call the completion handler once the
 * notification payload is passed to the `TwilioVoice.handleNotification()` method.
 */
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  RCTLogInfo(@"pushRegistry:didReceiveIncomingPushWithPayload:forType:withCompletionHandler:");
  
  // Save for later when the notification is properly handled.
  self.incomingPushCompletionCallback = completion;
  
  if ([type isEqualToString:PKPushTypeVoIP]) {
    if (![TwilioVoice handleNotification:payload.dictionaryPayload delegate:self]) {
      RCTLogInfo(@"This is not a valid Twilio Voice notification.");
      if (self->hasListeners) {
        [self sendEventWithName:@"EventErrorMessage" body:@{@"error": @"This is not a valid Twilio Voice notification."}];
      }
    }
  }
}

- (void)incomingPushHandled {
  if (self.incomingPushCompletionCallback) {
    self.incomingPushCompletionCallback();
    self.incomingPushCompletionCallback = nil;
  }
}



#pragma mark - TVONotificationDelegate
- (void)callInviteReceived:(TVOCallInvite *)callInvite {
  RCTLogInfo(@"callInviteReceived:");
  
  if (self.callInvite) {
    RCTLogInfo(@"已经有一个号码在请求了，忽略来自 %@", callInvite.from);
    [self incomingPushHandled];
    return;
  } else if (self.call) {
    RCTLogInfo(@"已经有一个号码接听了，忽略来自 %@", callInvite.from);
    [self incomingPushHandled];
    return;
  }
  self.callInvite = callInvite;
  NSString *ke_from = [callInvite.from stringByReplacingOccurrencesOfString:@"+" withString:@""];
  
  [self reportIncomingCallFrom:ke_from withUUID:callInvite.uuid];
}

- (void)cancelledCallInviteReceived:(TVOCancelledCallInvite *)cancelledCallInvite {
  RCTLogInfo(@"cancelledCallInviteReceived:");
  [self incomingPushHandled];
  if (!self.callInvite ||
      ![self.callInvite.callSid isEqualToString:cancelledCallInvite.callSid]) {
    RCTLogInfo(@"No matching pending CallInvite. Ignoring the Cancelled CallInvite");
    return;
  }
  [self performEndCallActionWithUUID:self.callInvite.uuid];
  self.callInvite = nil;
  [self incomingPushHandled];
}

#pragma mark - TVOCallDelegate
- (void)callDidStartRinging:(TVOCall *)call {
  RCTLogInfo(@"开始响铃:");
  if (hasListeners) {
    [self sendEventWithName:@"EventCallDidStartRinging" body:@{@"callSid": call.sid}];
  }
}

- (void)callDidConnect:(TVOCall *)call {
  RCTLogInfo(@"已经接听:");
  
  self.call = call;
  self.callKitCompletionCallback(YES);
  self.callKitCompletionCallback = nil;
  
  // 接受音频信息 //默认听筒
  [self toggleAudioRoute:self.amplification];
  self.call.muted = self.mute;
  
  if (hasListeners) {
    [self sendEventWithName:@"EventCallDidConnect" body:@{@"callSid": call.sid}];
  }
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
  RCTLogInfo(@"即将重新连接");
  
  if (hasListeners) {
    [self sendEventWithName:@"EventCallReconnecting" body:@{}];
  }
}

- (void)callDidReconnect:(TVOCall *)call {
  RCTLogInfo(@"重新连接");
  
  if (hasListeners) {
    [self sendEventWithName:@"EventCallReconnected" body:@{}];
  }
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
  RCTLogInfo(@"连接失败: %@", error);
  
  self.callKitCompletionCallback(NO);
  [self performEndCallActionWithUUID:call.uuid];
  [self callDisconnected];
  
  if (hasListeners) {
    [self sendEventWithName:@"EventCallDidFailed" body:@{@"error": [@(error.code) stringValue]}];
  }
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
  if (error) {
    RCTLogInfo(@"Call failed: %@", error);
  } else {
    RCTLogInfo(@"Call disconnected");
  }
  if (!self.userInitiatedDisconnect) {
    CXCallEndedReason reason = CXCallEndedReasonRemoteEnded;
    if (error) {
      reason = CXCallEndedReasonFailed;
    }
    [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:reason];
  }
  
  [self callDisconnected];
  
  if (hasListeners) {
    [self sendEventWithName:@"EventCallDisconnected" body:@{@"error": [@(error.code) stringValue]}];
  }
}

- (void)callDisconnected {
  @try {
    self.call = nil;
    self.callKitCompletionCallback = nil;
    self.userInitiatedDisconnect = NO;
  } @catch (NSException *exception) {
    
  } @finally {
    self.call = nil;
    self.callKitCompletionCallback = nil;
    self.userInitiatedDisconnect = NO;
  }
}

#pragma mark - AVAudioSession
- (void)toggleAudioRoute:(BOOL)toSpeaker {
  // The mode set by the Voice SDK is "VoiceChat" so the default audio route is the built-in receiver. Use port override to switch the route.
  self.audioDevice.block =  ^ {
    // We will execute `kDefaultAVAudioSessionConfigurationBlock` first.
    kTVODefaultAVAudioSessionConfigurationBlock();
    
    // Overwrite the audio route
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;
    if (toSpeaker) {
      if (![session overrideOutputAudioPort:AVAudioSessionPortOverrideSpeaker error:&error]) {
        NSLog(@"Unable to reroute audio: %@", [error localizedDescription]);
      }
    } else {
      if (![session overrideOutputAudioPort:AVAudioSessionPortOverrideNone error:&error]) {
        NSLog(@"Unable to reroute audio: %@", [error localizedDescription]);
      }
    }
  };
  self.audioDevice.block();
}

#pragma mark - CXProviderDelegate
//当接收到呼叫重置时 调用的函数，这个函数必须被实现，其不需做任何逻辑，只用来重置状态
- (void)providerDidReset:(CXProvider *)provider {
  RCTLogInfo(@"providerDidReset:");
  self.audioDevice.enabled = YES;
}
//呼叫开始时回调
- (void)providerDidBegin:(CXProvider *)provider {
  RCTLogInfo(@"providerDidBegin:");
}
//音频会话激活状态的回调
- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
  RCTLogInfo(@"provider:didActivateAudioSession:");
  self.audioDevice.enabled = YES;
}
//音频会话停用的回调
- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
  RCTLogInfo(@"provider:didDeactivateAudioSession:");
}
//行为超时的回调
- (void)provider:(CXProvider *)provider timedOutPerformingAction:(CXAction *)action {
  RCTLogInfo(@"provider:timedOutPerformingAction:");
}
//点击开始按钮的回调
- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
  RCTLogInfo(@"provider:performStartCallAction:");
  
  self.audioDevice.enabled = NO;
  self.audioDevice.block();
  
  [self.callKitProvider reportOutgoingCallWithUUID:action.callUUID startedConnectingAtDate:[NSDate date]];
  
  __weak typeof(self) weakSelf = self;
  [self performVoiceCallWithUUID:action.callUUID client:nil completion:^(BOOL success) {
    __strong typeof(self) strongSelf = weakSelf;
    if (success) {
      [strongSelf.callKitProvider reportOutgoingCallWithUUID:action.callUUID connectedAtDate:[NSDate date]];
      [action fulfill];
    } else {
      [action fail];
    }
  }];
}

//点击接听按钮的回调
- (void)provider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action {
  RCTLogInfo(@"provider:performAnswerCallAction:");
  
  NSAssert([self.callInvite.uuid isEqual:action.callUUID], @"We only support one Invite at a time.");
  
  self.audioDevice.enabled = NO;
  self.audioDevice.block();
  
  [self performAnswerVoiceCallWithUUID:action.callUUID completion:^(BOOL success) {
    if (success) {
      [action fulfill];
    } else {
      [action fail];
    }
  }];
  
  [action fulfill];
}
//点击结束按钮的回调
- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
  RCTLogInfo(@"provider:performEndCallAction:");
  
  if (self.callInvite) {
    [self.callInvite reject];
    if (self->hasListeners) {
      [self sendEventWithName:@"EventCallReject" body:@{@"sid": self.callInvite.callSid}];
    }
    self.callInvite = nil;
  } else if (self.call) {
    [self.call disconnect];
  }
  
  self.audioDevice.enabled = YES;
  [action fulfill];
}
//点击保持通话按钮的回调
- (void)provider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action {
  if (self.call && self.call.state == TVOCallStateConnected) {
    [self.call setOnHold:action.isOnHold];
    [action fulfill];
  } else {
    [action fail];
  }
}

#pragma mark - CallKit Actions
- (void)performStartCallActionWithUUID:(NSUUID *)uuid handle:(NSString *)handle {
  if (uuid == nil || handle == nil) {
    return;
  }
  
  CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handle];
  CXStartCallAction *startCallAction = [[CXStartCallAction alloc] initWithCallUUID:uuid handle:callHandle];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:startCallAction];
  
  [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
    if (error) {
      RCTLogInfo(@"StartCallAction transaction request failed: %@", [error localizedDescription]);
    } else {
      RCTLogInfo(@"StartCallAction transaction request successful");
      
      CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
      callUpdate.remoteHandle = callHandle;
      callUpdate.supportsDTMF = YES;
      callUpdate.supportsHolding = YES;
      callUpdate.supportsGrouping = NO;
      callUpdate.supportsUngrouping = NO;
      callUpdate.hasVideo = NO;
      
      [self.callKitProvider reportCallWithUUID:uuid updated:callUpdate];
    }
  }];
}

- (void)reportIncomingCallFrom:(NSString *)from withUUID:(NSUUID *)uuid {
  
  // 接受到来电（包括app内和app外）
  if([UIApplication sharedApplication].applicationState == UIApplicationStateActive) {
    
    
    // 应用程序在前台
//    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:from];
//    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
//    callUpdate.remoteHandle = callHandle;
//    callUpdate.supportsDTMF = YES;
//    callUpdate.supportsHolding = YES;
//    callUpdate.supportsGrouping = NO;
//    callUpdate.supportsUngrouping = NO;
//    callUpdate.hasVideo = NO;
//    [self.callKitProvider reportCallWithUUID:uuid updated:callUpdate];
  
    if (self->hasListeners) {
      [self sendEventWithName:@"EventCallComingInApp" body:@{@"from": from, @"uuid": uuid.UUIDString}];
    }
    
  } else {
    // 应用程序在后台
    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:from];
    
    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = callHandle;
    callUpdate.supportsDTMF = YES;
    callUpdate.supportsHolding = YES;
    callUpdate.supportsGrouping = NO;
    callUpdate.supportsUngrouping = NO;
    callUpdate.hasVideo = NO;
    
    [self.callKitProvider reportNewIncomingCallWithUUID:uuid update:callUpdate completion:^(NSError *error) {
      NSString *errorStr = @"";
      if (!error) {
        RCTLogInfo(@"Incoming call successfully reported.");
      }
      else {
        RCTLogInfo(@"Failed to report incoming call : %@.", [error localizedDescription]);
        errorStr = [NSString stringWithFormat:@"Failed to report incoming call : %@.", [error localizedDescription]];
      }
      if (self->hasListeners) {
        [self sendEventWithName:@"EventCallComingOutApp" body:@{@"error":[@(error.code) stringValue], @"from": from, @"uuid": uuid.UUIDString}];
      }
    }];
    
  }
}

- (void)performEndCallActionWithUUID:(NSUUID *)uuid {
  
  RCTLogInfo(@"%@", self.call.sid);
  CXEndCallAction *endCallAction = [[CXEndCallAction alloc] initWithCallUUID:uuid];
  CXTransaction *transaction = [[CXTransaction alloc] initWithAction:endCallAction];
  
  [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
    NSString *errorStr = @"";
    if (error) {
      RCTLogInfo(@"EndCallAction transaction request failed: %@", [error localizedDescription]);
      errorStr = [NSString stringWithFormat:@"EndCallAction transaction request failed: %@", [error localizedDescription]];
    }
    else {
      RCTLogInfo(@"EndCallAction transaction request successful");
    }
    if (self->hasListeners) {
      [self sendEventWithName:@"EvemtEndCallAction" body:@{@"error":[@(error.code) stringValue], @"uuid": uuid.UUIDString}];
    }
  }];
}

- (void)performVoiceCallWithUUID:(NSUUID *)uuid
                          client:(NSString *)client
                      completion:(void(^)(BOOL success))completionHandler {
  __weak typeof(self) weakSelf = self;
  TVOConnectOptions *connectOptions = [TVOConnectOptions optionsWithAccessToken:self.current_accessToken block:^(TVOConnectOptionsBuilder *builder) {
    __strong typeof(self) strongSelf = weakSelf;
    builder.params = strongSelf.callphone_params;
    builder.uuid = uuid;
  }];
  self.call = [TwilioVoice connectWithOptions:connectOptions delegate:self];
  self.callKitCompletionCallback = completionHandler;
  
  if (self->hasListeners) {
    [self sendEventWithName:@"EvemtVoiceCallComingStart" body:@{@"error":@"", @"uuid": uuid.UUIDString}];
  }
}

- (void)performAnswerVoiceCallWithUUID:(NSUUID *)uuid
                            completion:(void(^)(BOOL success))completionHandler {
  
  TVOAcceptOptions *acceptOptions = [TVOAcceptOptions optionsWithCallInvite:self.callInvite block:^(TVOAcceptOptionsBuilder *builder) {
    builder.uuid = uuid;
  }];
  
  self.call = [self.callInvite acceptWithOptions:acceptOptions delegate:self];
  
  if (!self.call) {
    completionHandler(NO);
  } else {
    self.callKitCompletionCallback = completionHandler;
  }
  
  self.callInvite = nil;
  [self incomingPushHandled];
  
  if (self->hasListeners) {
    [self sendEventWithName:@"EventCallComingStart" body:@{@"error":@"", @"uuid": uuid.UUIDString}];
  }
}

@end
