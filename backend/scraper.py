import requests
import os
import time

def scrape_reddit_images(target_count=50):
    if not os.path.exists('lost_pet_images'):
        os.makedirs('lost_pet_images')

    # Add a custom User-Agent so Reddit doesn't block the request
    headers = {'User-Agent': 'SlugHacksBot/0.1'}
    
    # Subreddits likely to have lost/found pet photos
    subreddits = ["lostpets", "rescuedogs", "findpets", "lostcats", "rescuecats"]
    downloaded = 0

    for sub in subreddits:
        if downloaded >= target_count: break
        
        # Adding .json to the URL gives you the raw data
        url = f"https://www.reddit.com/r/{sub}/new.json?limit=100"
        response = requests.get(url, headers=headers).json()

        for post in response['data']['children']:
            if downloaded >= target_count: break
            
            post_data = post['data']
            image_url = post_data.get('url', '')

            # Only download if it's a direct image link
            if any(image_url.endswith(ext) for ext in ['.jpg', '.png', '.jpeg']):
                try:
                    img_data = requests.get(image_url).content
                    filename = f"lost_pet_images/pet_{downloaded}.jpg"
                    
                    with open(filename, 'wb') as f:
                        f.write(img_data)
                    
                    downloaded += 1
                    print(f"[{downloaded}/{target_count}] Saved: {image_url}")
                    time.sleep(0.5) # Be nice to Reddit's servers
                except:
                    continue

    print(f"✅ Successfully downloaded {downloaded} images.")

scrape_reddit_images(50)
