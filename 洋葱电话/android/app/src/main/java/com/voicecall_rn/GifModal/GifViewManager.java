package com.voicecall_rn.GifModal;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.widget.ImageView;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.imagehelper.ImageSource;
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper;
import com.voicecall_rn.MainApplication;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import pl.droidsonroids.gif.GifDrawable;

/**
 * GifView
 * Created by songlcy on 2018/4/16.
 */

public class GifViewManager extends SimpleViewManager<ImageView> implements LifecycleEventListener{

    private GifDrawable gifDrawable;
    private ThemedReactContext mContext;
    private Map<String, byte[]> imageCache = new HashMap<>();
    private OkHttpClient mOkHttpClient = new OkHttpClient();
    private static final String GIFVIEW_MANAGER_NAME = "GIFImageView";

    private static final String DATA_SCHEME = "data";
    private static final String LOCAL_RESOURCE_SCHEME = "res";
    private static final String ANDROID_RESOURCE_SCHEME = "android.resource";
    private static final String ANDROID_CONTENT_SCHEME = "content";
    private static final String LOCAL_FILE_SCHEME = "file";

    @Override
    public String getName() {
        return GIFVIEW_MANAGER_NAME;
    }

    /**
     * 此处创建View实例，并返回
     * @param reactContext
     * @return
     */
    @Override
    protected ImageView createViewInstance(ThemedReactContext reactContext) {
        this.mContext = reactContext;
        this.mContext.addLifecycleEventListener(this);
        ImageView imageView = new ImageView(reactContext);
        return imageView;
    }

    /**
     * 加载手机本地目录图片
     * @param uri
     * @return
     */
    private static Drawable loadFile(Uri uri) {
        Bitmap bitmap = BitmapFactory.decodeFile(uri.getPath());
        return new BitmapDrawable(MainApplication.instance.getResources(), bitmap);
    }

    /**
     * 加载drawable目录下的图片
     * @param iconUri
     * @return
     */
    private static Drawable loadResource(String iconUri) {
        return ResourceDrawableIdHelper
                .getInstance()
                .getResourceDrawable(MainApplication.instance, iconUri);
    }

    @ReactProp(name = "source")
    public void setSource(final ImageView image, String source) {
//        if(gifDrawable != null && gifDrawable.isPlaying()) {
//            gifDrawable.stop();
//        }
//        if(imageCache.containsKey(source)) {
//            showGifImage(image,imageCache.get(source));
//        } else {
//            loadImage(image, source);
//        }

        Drawable drawable = BitmapUtil.loadImage(source);

        showGifImage(image, drawable);

    }

    /**
     * 切换播放状态
     * @param image
     * @param status true: 播放 false： 暂停
     */
    @ReactProp(name = "playStatus")
    public void setPlayingStatus(ImageView image, Boolean status) {
        if(gifDrawable != null) {
            if(status) {
                if(!gifDrawable.isPlaying()) {
                    gifDrawable.start();
                }
            } else {
                if(gifDrawable.isPlaying()) {
                    gifDrawable.stop();
                }
            }
        }
    }

    /**
     * 下载Gif,获取图片字节流
     * @param image 组件实例
     * @param url Gif图片URL
     */
    private void loadImage(final ImageView image, final String url) {
        Request request = new Request.Builder().url(url).build();
        Call call = mOkHttpClient.newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onResponse(Call call, final Response response) throws IOException {
                mContext.runOnUiQueueThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            showGifImage(image, response.body().bytes());
                            imageCache.put(url, response.body().bytes());
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                });
            }
            @Override
            public void onFailure(Call call, IOException e) {
            }
        });
    }

    /**
     * 渲染Gif图
     */
    private void showGifImage(final ImageView image, final byte[] imageBytes) {
        try {
            gifDrawable = new GifDrawable(imageBytes);
        } catch (IOException e) {
            e.printStackTrace();
        }
        image.setBackground(gifDrawable);
    }

    /**
     * 渲染Gif图
     */
    private void showGifImage(final ImageView image, Drawable drawable) {
        try {
            Bitmap bitmap = ((BitmapDrawable)drawable).getBitmap();

            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream);
            byte[] bitmapdata = stream.toByteArray();

            gifDrawable = new GifDrawable(bitmapdata);
        } catch (IOException e) {
            e.printStackTrace();
        }
        image.setBackground(gifDrawable);
    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
        imageCache.clear();
        gifDrawable.recycle();
    }

}
